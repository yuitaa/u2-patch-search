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
    option.textContent = name + ' (exp)';
  } else {
    option.textContent = name;
  }
  option.value = name;
  return option
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
      if (i === array.length - 1) {
        option.selected = true;
      }
      document.getElementById('version-end').appendChild(option);
    });
})