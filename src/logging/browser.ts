import type { Logger } from './logger';

function cleanLabel(value: string | null | undefined): string | undefined {
  return value?.replace(/\s+/g, ' ').trim().slice(0, 160) || undefined;
}

function readableText(element: Element): string {
  // Exclude decorative icons and editable contents from click descriptions.
  if (element.matches('[aria-hidden="true"], [hidden], script, style, input, select, textarea, [contenteditable]')) return '';
  return Array.from(element.childNodes, (node) => {
    if (node.nodeType === 3) return node.textContent;
    return node.nodeType === 1 ? readableText(node as Element) : '';
  }).join(' ');
}

function elementLabel(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const labelledBy = element.getAttribute('aria-labelledby')?.split(/\s+/).map((id) => {
    const label = element.ownerDocument.getElementById(id);
    return label ? readableText(label) : '';
  }).join(' ');
  const formLabel = element.matches('input, select, textarea')
    ? Array.from((element as HTMLInputElement).labels ?? [], readableText).join(' ')
    : undefined;
  return cleanLabel(element.getAttribute('data-log-label'))
    ?? cleanLabel(labelledBy)
    ?? cleanLabel(element.getAttribute('aria-label'))
    ?? cleanLabel(formLabel)
    ?? cleanLabel(element.getAttribute('alt'))
    ?? cleanLabel(readableText(element));
}

function regionLabel(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  return cleanLabel(element.getAttribute('data-log-section'))
    ?? cleanLabel(element.getAttribute('aria-label'))
    ?? elementLabel(element.querySelector('h1, h2, h3, h4, h5, h6'))
    ?? cleanLabel(element.id)
    ?? ({ HEADER: 'Site header', FOOTER: 'Site footer', NAV: 'Navigation', MAIN: 'Main content' } as Record<string, string>)[element.tagName];
}

/** Returns a cleanup function so hot reloads don't accumulate listeners. */
export function installBrowserLogging(logger: Logger, target: Window = window): () => void {
  function onClick(event: MouseEvent) {
    // composedPath also identifies elements inside open shadow roots.
    const element = event.composedPath().find((node): node is Element =>
      'nodeType' in node && (node as Node).nodeType === 1,
    );
    const control = element?.closest('a, button, input, select, textarea, summary, [role="button"], [role="link"], [data-log-label]');
    const descriptiveElement = control ?? element?.closest('h1, h2, h3, h4, h5, h6, p, li, label, figcaption, span, strong, em, img');
    const label = elementLabel(descriptiveElement);
    const region = (control ?? element)?.closest('[data-log-section], nav, article, section, aside, header, footer, main');
    const section = regionLabel(region);
    const page = target.location.pathname === '/' ? 'Home'
      : cleanLabel(target.document?.title.split(' — ')[0]) ?? target.location.pathname;
    const controlType = control?.getAttribute('role')
      ?? (control?.matches('a') ? 'link' : control?.tagName.toLowerCase());
    const link = element?.closest('a[href]');
    let destination: string | undefined;
    let destinationSection: string | undefined;
    const explicitAction = control?.getAttribute('data-log-action');
    let action = explicitAction
      ?? (control?.hasAttribute('aria-pressed') ? 'select'
        : control?.hasAttribute('aria-expanded') ? 'toggle' : 'click');
    if (link) {
      try {
        const url = new URL(link.getAttribute('href')!, target.location.href);
        // Keep link destinations useful without copying queries or fragments.
        destination = ['http:', 'https:'].includes(url.protocol)
          ? `${url.origin}${url.pathname}`
          : url.protocol;
        if (url.origin === target.location.origin && url.hash) {
          const sectionElement = target.document?.getElementById(decodeURIComponent(url.hash.slice(1)));
          destinationSection = regionLabel(sectionElement);
        }
        action = explicitAction ?? (link.hasAttribute('download') ? 'download'
          : destinationSection ? 'navigate to section'
          : url.protocol === 'mailto:' ? 'open email'
          : url.protocol === 'tel:' ? 'start call' : 'navigate');
      } catch { /* Malformed links still produce a click log. */ }
    }
    const clicked = label ? `"${label}" ${controlType ?? 'text'}`
      : controlType ?? (element?.matches('body, main, section, div') ? 'page background' : element?.tagName.toLowerCase()) ?? 'page background';
    const gesture = event.button === 1 ? 'Middle-clicked' : event.button === 2 ? 'Right-clicked' : 'Clicked';
    const description = `${gesture} ${clicked} on "${page}"${section ? ` in "${section}"` : ''}`
      + (destinationSection ? ` → section "${destinationSection}"` : destination ? ` → ${destination}` : '');

    logger.info('browser.click', {
      context: {
        description,
        action,
        page,
        section,
        pathname: target.location.pathname,
        eventType: event.type,
        element: element?.tagName.toLowerCase(),
        elementId: element?.id || undefined,
        control: control?.tagName.toLowerCase(),
        controlId: control?.id || undefined,
        label,
        controlType,
        pressedBefore: control?.getAttribute('aria-pressed') ?? undefined,
        expandedBefore: control?.getAttribute('aria-expanded') ?? undefined,
        destination,
        destinationSection,
        mouseButton: event.button,
        clickCount: event.detail,
        x: event.clientX,
        y: event.clientY,
      },
    });
  }

  function onError(event: ErrorEvent) {
    logger.error('browser.uncaught_error', {
      error: event.error ?? event.message,
      context: {
        pathname: target.location.pathname,
        line: event.lineno,
        column: event.colno,
      },
    });
  }

  function onUnhandledRejection(event: PromiseRejectionEvent) {
    logger.error('browser.unhandled_rejection', {
      error: event.reason,
      context: { pathname: target.location.pathname },
    });
  }

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onUnhandledRejection);
  // Capture before React handlers can stop propagation or change routes/elements.
  target.addEventListener('click', onClick, { capture: true });
  target.addEventListener('auxclick', onClick, { capture: true });

  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onUnhandledRejection);
    target.removeEventListener('click', onClick, { capture: true });
    target.removeEventListener('auxclick', onClick, { capture: true });
  };
}
