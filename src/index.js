import './style.css';
import { fixTypes, versions, changeLogs } from './generated/data.js';
import { fixTypePrefixes } from './consts.js'

function createFixTypeCheckbox(name) {
  function toTitleCase(str) {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function getTwemojiCdnUrl(emoji) {
    const unicode = Array.from(emoji)
      .map(char => `${char.codePointAt(0).toString(16).toLowerCase()}`)
      .join('');
    const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/72x72/${unicode}.png`;
    return url;
  }

  const container = document.createElement('div');

  // label
  const label = document.createElement('label');
  label.classList.add('form-check-label');
  const text = document.createTextNode(toTitleCase(name));

  // input
  const checkbox = document.createElement('input');
  checkbox.classList.add('form-check-input');
  checkbox.type = 'checkbox';
  checkbox.value = name;
  checkbox.checked = true;
  checkbox.addEventListener('change', onFormUpdate)
  label.appendChild(checkbox);

  //prefix
  if (fixTypePrefixes[name]) {
    const prefix = document.createElement('img');
    prefix.src = getTwemojiCdnUrl(fixTypePrefixes[name]);
    prefix.alt = name;
    prefix.classList.add('me-1', 'emoji');
    label.appendChild(prefix);
  }

  label.appendChild(text);

  container.appendChild(label);

  return container;
}

function createVersionOption(name, isExpVersion) {
  const option = document.createElement('option');
  if (isExpVersion) {
    option.textContent = name + ' (Exp)';
  } else {
    option.textContent = name;
  }
  option.value = name;
  return option
}

function getFormData() {
  const query = document.getElementById('query').value;

  const excludeTypes = [];
  const allCheckboxes = document.querySelectorAll('#fix-types-group input[type="checkbox"]');
  allCheckboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
      excludeTypes.push(checkbox.value);
    }
  });

  const versionStart = document.getElementById('version-start').value;
  const versionEnd = document.getElementById('version-end').value;
  const include = document.getElementById('include').value;

  const formData = {
    query: query,
    excludeTypes: excludeTypes,
    versionStart: versionStart,
    versionEnd: versionEnd,
    include: include
  };

  return formData;
}

function setFormData(data) {
  document.getElementById('query').value = data.query;

  document.querySelectorAll('#fix-types-group input[type="checkbox"]').forEach(cb => cb.checked = true);
  (data.excludeTypes || []).forEach(type => {
    const checkbox = document.querySelector(`#fix-types-group input[type="checkbox"][value='${type}']`);
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  document.getElementById('version-start').value = data.versionStart;
  document.getElementById('version-end').value = data.versionEnd;
  document.getElementById('include').value = data.include;
}

function parseFormData(data) {
  const params = new URLSearchParams();
  params.set('query', data.query || '');
  params.set('excludeTypes', (data.excludeTypes || []).join(','));
  params.set('versionStart', data.versionStart || '');
  params.set('versionEnd', data.versionEnd || '');
  params.set('include', data.include || 'all');
  return params.toString();
}

function parseQuery(search) {
  const params = new URLSearchParams(search);
  const result = {
    query: params.get('query') || '',
    excludeTypes: [],
    versionStart: params.get('versionStart') || '',
    versionEnd: params.get('versionEnd') || '',
    include: params.get('include') || 'all'
  };

  const excludeParam = params.get('excludeTypes');
  if (excludeParam) {
    result.excludeTypes = excludeParam.split(',');
  }

  return result;
}

function onFormUpdate() {
  const searchParam = parseFormData(getFormData());

  if (searchParam) {
    const url = `${location.origin}${location.pathname}?${searchParam}`;
    history.replaceState(null, "", url);
  } else {
    const url = `${location.origin}${location.pathname}`;
    history.replaceState(null, "", url);
  }
}

window.addEventListener('load', () => {
  // 種類
  fixTypes
    .map(createFixTypeCheckbox)
    .forEach((c) => { document.getElementById('fix-types-group').appendChild(c) });

  versions
    .forEach((version) => {
      const option = createVersionOption(version.version, version.exp);
      document.getElementById('version-start').appendChild(option);
    });

  versions
    .forEach((version, i, array) => {
      const option = createVersionOption(version.version, version.exp);
      document.getElementById('version-end').appendChild(option);
    });

  ['version-start', 'version-end', 'include'].forEach((id) => { document.getElementById(id).addEventListener('change', onFormUpdate) });
  document.getElementById('query').addEventListener('input', onFormUpdate)
  setFormData(parseQuery(location.search));
})