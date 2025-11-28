export function getConfig() {
    const scriptTag = document.getElementById('imatic-inline-edit');
    if (!scriptTag) return;

    return JSON.parse(scriptTag.dataset.inlineConfig || '{}');
}

export function showEditIcon(node: HTMLElement) {
    const icon = document.createElement('span');
    icon.className = 'inline-edit-icon fa fa-pencil';
    icon.id = 'inline-edit-icon';
    icon.style.margin = '4px';
    icon.style.padding = '4px';
    icon.style.border = '2px solid #ddd';
    icon.style.cursor = 'pointer';
    icon.title = 'Klikni pro úpravu';
    node.prepend(icon);

    return icon;
}

export function getBugIdFromUrl(): number | null {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? parseInt(id) : null;
}

export function hover(td: HTMLElement) {
    td.addEventListener('mouseenter', () => {
        td.style.backgroundColor = '#f0f8ff';
    });
    td.addEventListener('mouseleave', () => {
        td.style.backgroundColor = '';
    });
}