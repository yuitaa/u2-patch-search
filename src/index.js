import './style.css';
import { fixTypes, versions, versionIndexes, changeLogs } from './generated/data.js';
import { fixTypePrefixes } from './consts.js'

function toTitleCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getVersionData(version) {
  return versions[versionIndexes[version]];
}

function getTwemojiCdnUrl(emoji) {
  const unicode = Array.from(emoji)
    .map(char => `${char.codePointAt(0).toString(16).toLowerCase()}`)
    .join('');
  const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/72x72/${unicode}.png`;
  return url;
}

function createFixTypeCheckbox(name) {
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

function createTableRow(data, query) {
  function highlightText(text, target) {
    function escapeHtml(string) {
      return string.replace(/[&'`"<>]/g, function (match) {
        return {
          '&': '&amp;',
          "'": '&#x27;',
          '`': '&#x60;',
          '"': '&quot;',
          '<': '&lt;',
          '>': '&gt;',
        }[match]
      });
    }
    const escapedText = escapeHtml(text);
    const escapedTarget = escapeHtml(target);

    const index = escapedText.toLowerCase().indexOf(escapedTarget.toLowerCase());
    if (index === -1) return escapedText;

    const before = escapedText.slice(0, index);
    const after = escapedText.slice(index + escapedTarget.length);
    const inner = escapedText.slice(index, index + escapedTarget.length);

    const wrapped = `<span class="text-bg-warning">${inner}</span>`;

    return before + wrapped + after;
  }

  const versionData = getVersionData(data.version);
  const prefixEmoji = fixTypePrefixes[data.type];

  const container = document.createElement('div');
  container.classList.add('row', 'border-bottom', 'pt-1', 'result-table-row');

  // バージョン
  const version = document.createElement('div');
  version.classList.add(
    'col-6',
    'col-md-2',
    'text-truncate',
    'text-nowrap',
    'd-flex',
    'align-items-start'
  );
  if (versionData.exp) {
    const expBadge = document.createElement('div');
    expBadge.classList.add('badge', 'text-bg-dark', 'me-1');
    expBadge.textContent = 'Exp';
    version.appendChild(expBadge)
  }
  const versionLink = document.createElement('a');
  versionLink.classList.add('fw-bold', 'text-reset');
  versionLink.title = `${versionData.date} | ${versionData.version}`;
  versionLink.href = versionData.url;
  versionLink.textContent = versionData.version;
  version.appendChild(versionLink);
  container.appendChild(version);

  // 種類
  const type = document.createElement('div');
  type.classList.add(
    'col-6',
    'col-md-1',
    'text-truncate',
    'text-nowrap'
  );

  if (prefixEmoji) {
    const prefix = document.createElement('img');
    prefix.src = getTwemojiCdnUrl(prefixEmoji);
    prefix.alt = prefixEmoji;
    prefix.classList.add('me-1', 'emoji');
    type.appendChild(prefix);
  };
  type.appendChild(document.createTextNode(toTitleCase(data.type)));
  container.appendChild(type)

  // 内容
  const content = document.createElement('div');
  content.classList.add('col', 'col-md-9');
  if (query) {
    content.innerHTML = highlightText(data.text, query);
  } else {
    content.textContent = data.text;
  };
  container.appendChild(content);
  return container;
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
  const formData = getFormData();
  const searchParam = parseFormData(formData);

  if (searchParam) {
    const url = `${location.origin}${location.pathname}?${searchParam}`;
    history.replaceState(null, "", url);
  } else {
    const url = `${location.origin}${location.pathname}`;
    history.replaceState(null, "", url);
  };

  document.querySelectorAll('.result-table-row').forEach(el => el.remove());

  // 検索
  const searchResult = changeLogs
    .filter((change) => {
      const versionData = getVersionData(change.version);

      const versionIndexThis = versionIndexes[versionData.version];
      const versionIndexStart = versionIndexes[formData.versionStart];
      const versionIndexEnd = versionIndexes[formData.versionEnd];

      if (formData.excludeTypes.includes(change.type)) { return false; };
      if (versionData.exp && formData.include === 'stable') { return false; };
      if (!versionData.exp && formData.include === 'exp') { return false; };
      if (versionIndexThis < versionIndexStart || versionIndexEnd < versionIndexThis) { return false };
      if (formData.query && change.text.toLocaleLowerCase().indexOf(formData.query.toLowerCase()) === -1) { return false; };
      return true;
    });
  document.getElementById('found-count').textContent = searchResult.length;
  searchResult.forEach((change) => {
    document.getElementById('result-table').appendChild(createTableRow(change, formData.query));
  });
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
    .forEach((version) => {
      const option = createVersionOption(version.version, version.exp);
      document.getElementById('version-end').appendChild(option);
    });

  ['version-start', 'version-end', 'include'].forEach((id) => { document.getElementById(id).addEventListener('change', onFormUpdate) });
  document.getElementById('query').addEventListener('input', onFormUpdate)
  setFormData(parseQuery(location.search));

  onFormUpdate();
})