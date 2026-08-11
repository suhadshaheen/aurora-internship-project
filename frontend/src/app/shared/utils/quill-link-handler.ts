// Quill's default Snow-theme "link" handler silently no-ops when nothing is
// selected (see quill/themes/snow.js), which looks like the button is dead.
// This override falls back to prompting for a URL and inserting it as a link
// at the cursor when there's no selection, matching common editor UX.
export function quillLinkHandler(this: { quill: any }, value: boolean): void {
  const { quill } = this;
  if (!value) {
    quill.format('link', false, 'user');
    return;
  }

  const range = quill.getSelection();

  if (range && range.length > 0) {
    let preview = quill.getText(range.index, range.length);
    if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
      preview = `mailto:${preview}`;
    }
    quill.theme.tooltip.edit('link', preview);
    return;
  }

  const url = window.prompt('Enter link URL:');
  if (!url) {
    return;
  }
  const index = range ? range.index : quill.getLength();
  quill.insertText(index, url, 'link', url, 'user');
  quill.setSelection(index + url.length, 0, 'user');
}
