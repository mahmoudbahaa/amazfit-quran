import { parseNPluralFromHeadersSafely, parseHeader } from './shared.js';

/**
 * Parses a PO object into translation table
 *
 * @typedef {{ defaultCharset?: string, validation?: boolean }} Options
 * @param {string | Buffer} input PO object
 * @param {Options} [options] Optional options with defaultCharset and validation
 */
export function parse(input, options = {}) {
  const parser = new Parser(input, options);
  return parser.parse();
}

/**
 * Creates a PO parser object. If PO object is a string,
 * UTF-8 will be used as the charset
 *
 * @typedef {{ defaultCharset?: string, validation?: boolean }} Options
 * @constructor
 * @param {string | Buffer} fileContents PO object
 * @param {Options} options Options with defaultCharset and validation
 */
function Parser(fileContents, {
  validation = false,
}) {
  this._validation = validation;

  this._lex = [];
  this._escaped = false;
  this._node = {};
  this._state = this.states.none;
  this._lineNumber = 1;

  if (typeof fileContents === 'string') {
    this._fileContents = fileContents;
  } else {
    this._fileContents = fileContents.toString();
  }
}

/**
 * Parses the PO object and returns translation table
 *
 * @return {Object} Translation table
 */
Parser.prototype.parse = function () {
  this._lexer(this._fileContents);

  return this._finalize(this._lex);
};

/**
 * State constants for parsing FSM
 */
Parser.prototype.states = {
  none: 0x01,
  comments: 0x02,
  key: 0x03,
  string: 0x04,
  obsolete: 0x05,
};

/**
 * Value types for lexer
 */
Parser.prototype.types = {
  comments: 0x01,
  key: 0x02,
  string: 0x03,
  obsolete: 0x04,
};

/**
 * String matches for lexer
 */
Parser.prototype.symbols = {
  quotes: /["']/,
  comments: /#/,
  whitespace: /\s/,
  key: /[\w\-[\]]/,
  keyNames: /^(?:msgctxt|msgid(?:_plural)?|msgstr(?:\[\d+])?)$/,
};

/**
 * Token parser. Parsed state can be found from this._lex
 *
 * @param {String} chunk String
 */
Parser.prototype._lexer = function (chunk) {
  let chr;

  for (let i = 0, len = chunk.length; i < len; i++) {
    chr = chunk.charAt(i);

    if (chr === '\n') {
      this._lineNumber += 1;
    }

    switch (this._state) {
      case this.states.none:
      case this.states.obsolete:
        if (chr.match(this.symbols.quotes)) {
          this._node = {
            type: this.types.string,
            value: '',
            quote: chr,
          };
          this._lex.push(this._node);
          this._state = this.states.string;
        } else if (chr.match(this.symbols.comments)) {
          this._node = {
            type: this.types.comments,
            value: '',
          };
          this._lex.push(this._node);
          this._state = this.states.comments;
        } else if (!chr.match(this.symbols.whitespace)) {
          this._node = {
            type: this.types.key,
            value: chr,
          };
          if (this._state === this.states.obsolete) {
            this._node.obsolete = true;
          }

          this._lex.push(this._node);
          this._state = this.states.key;
        }

        break;
      case this.states.comments:
        if (chr === '\n') {
          this._state = this.states.none;
        } else if (chr === '~' && this._node.value === '') {
          this._node.value += chr;
          this._state = this.states.obsolete;
        } else if (chr !== '\r') {
          this._node.value += chr;
        }

        break;
      case this.states.string:
        if (this._escaped) {
          switch (chr) {
            case 't':
              this._node.value += '\t';
              break;
            case 'n':
              this._node.value += '\n';
              break;
            case 'r':
              this._node.value += '\r';
              break;
            default:
              this._node.value += chr;
          }

          this._escaped = false;
        } else {
          if (chr === this._node.quote) {
            this._state = this.states.none;
          } else if (chr === '\\') {
            this._escaped = true;
            break;
          } else {
            this._node.value += chr;
          }

          this._escaped = false;
        }

        break;
      case this.states.key:
        if (!chr.match(this.symbols.key)) {
          if (!this._node.value.match(this.symbols.keyNames)) {
            const err = new SyntaxError(`Error parsing PO data: Invalid key name "${this._node.value}" at line ${this._lineNumber}. This can be caused by an unescaped quote character in a msgid or msgstr value.`);

            err.lineNumber = this._lineNumber;

            throw err;
          }

          this._state = this.states.none;
          i--;
        } else {
          this._node.value += chr;
        }

        break;
    }
  }
};

/**
 * Join multi line strings
 *
 * @param {Object} tokens Parsed tokens
 * @return {Object} Parsed tokens, with multi line strings joined into one
 */
Parser.prototype._joinStringValues = function (tokens) {
  const response = [];
  let lastNode;

  for (let i = 0, len = tokens.length; i < len; i++) {
    if (lastNode && tokens[i].type === this.types.string && lastNode.type === this.types.string) {
      lastNode.value += tokens[i].value;
    } else if (lastNode && tokens[i].type === this.types.comments && lastNode.type === this.types.comments) {
      lastNode.value += '\n' + tokens[i].value;
    } else {
      response.push(tokens[i]);
      lastNode = tokens[i];
    }
  }

  return response;
};

/**
 * Parse comments into separate comment blocks
 *
 * @param {Object} tokens Parsed tokens
 */
Parser.prototype._parseComments = function (tokens) {
  // Parse comments
  tokens.forEach(node => {
    if (!node || node.type !== this.types.comments) {
      return;
    }

    const comment = {
      translator: [],
      extracted: [],
      reference: [],
      flag: [],
      previous: [],
    };

    const lines = (node.value || '').split(/\n/);

    lines.forEach(line => {
      switch (line.charAt(0) || '') {
        case ':':
          comment.reference.push(line.substr(1).trim());
          break;
        case '.':
          comment.extracted.push(line.substr(1).replace(/^\s+/, ''));
          break;
        case ',':
          comment.flag.push(line.substr(1).replace(/^\s+/, ''));
          break;
        case '|':
          comment.previous.push(line.substr(1).replace(/^\s+/, ''));
          break;
        case '~':
          break;
        default:
          comment.translator.push(line.replace(/^\s+/, ''));
      }
    });

    node.value = {};

    Object.keys(comment).forEach(key => {
      if (comment[key] && comment[key].length) {
        node.value[key] = comment[key].join('\n');
      }
    });
  });
};

/**
 * Join gettext keys with values
 *
 * @param {Object} tokens Parsed tokens
 * @return {Object} Tokens
 */
Parser.prototype._handleKeys = function (tokens) {
  const response = [];
  let lastNode;

  for (let i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === this.types.key) {
      lastNode = {
        key: tokens[i].value,
      };
      if (tokens[i].obsolete) {
        lastNode.obsolete = true;
      }

      if (i && tokens[i - 1].type === this.types.comments) {
        lastNode.comments = tokens[i - 1].value;
      }

      lastNode.value = '';
      response.push(lastNode);
    } else if (tokens[i].type === this.types.string && lastNode) {
      lastNode.value += tokens[i].value;
    }
  }

  return response;
};

/**
 * Separate different values into individual translation objects
 *
 * @param {Object} tokens Parsed tokens
 * @return {Object} Tokens
 */
Parser.prototype._handleValues = function (tokens) {
  const response = [];
  let lastNode;
  let curContext;
  let curComments;

  for (let i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].key.toLowerCase() === 'msgctxt') {
      curContext = tokens[i].value;
      curComments = tokens[i].comments;
    } else if (tokens[i].key.toLowerCase() === 'msgid') {
      lastNode = {
        msgid: tokens[i].value,
      };
      if (tokens[i].obsolete) {
        lastNode.obsolete = true;
      }

      if (curContext) {
        lastNode.msgctxt = curContext;
      }

      if (curComments) {
        lastNode.comments = curComments;
      }

      if (tokens[i].comments && !lastNode.comments) {
        lastNode.comments = tokens[i].comments;
      }

      curContext = false;
      curComments = false;
      response.push(lastNode);
    } else if (tokens[i].key.toLowerCase() === 'msgid_plural') {
      if (lastNode) {
        if (this._validation && 'msgid_plural' in lastNode) {
          throw new SyntaxError(`Multiple msgid_plural error: entry "${lastNode.msgid}" in "${lastNode.msgctxt || ''}" context has multiple msgid_plural declarations.`);
        }

        lastNode.msgid_plural = tokens[i].value;
      }

      if (tokens[i].comments && !lastNode.comments) {
        lastNode.comments = tokens[i].comments;
      }

      curContext = false;
      curComments = false;
    } else if (tokens[i].key.substr(0, 6).toLowerCase() === 'msgstr') {
      if (lastNode) {
        lastNode.msgstr = (lastNode.msgstr || []).concat(tokens[i].value);
      }

      if (tokens[i].comments && !lastNode.comments) {
        lastNode.comments = tokens[i].comments;
      }

      curContext = false;
      curComments = false;
    }
  }

  return response;
};

/**
 * Validate token
 *
 * @param {Object} token Parsed token
 * @param {Object} translations Translation table
 * @param {string} msgctxt Message entry context
 * @param {number} nplurals Number of epected plural forms
 * @throws Will throw an error if token validation fails
 */
Parser.prototype._validateToken = function (
  {
    msgid = '',
    msgid_plural = '',
    msgstr = [],
  },
  translations,
  msgctxt,
  nplurals,
) {
  if (!this._validation) {
    return;
  }

  if (msgid in translations[msgctxt]) {
    throw new SyntaxError(`Duplicate msgid error: entry "${msgid}" in "${msgctxt}" context has already been declared.`);
  } else if (msgid_plural && msgstr.length !== nplurals) {
    throw new RangeError(`Plural forms range error: Expected to find ${nplurals} forms but got ${msgstr.length} for entry "${msgid_plural}" in "${msgctxt}" context.`);
  } else if (!msgid_plural && msgstr.length !== 1) {
    throw new RangeError(`Translation string range error: Extected 1 msgstr definitions associated with "${msgid}" in "${msgctxt}" context, found ${msgstr.length}.`);
  }
};

/**
 * Compose a translation table from tokens object
 *
 * @param {Object} tokens Parsed tokens
 * @return {Object} Translation table
 */
Parser.prototype._normalize = function (tokens) {
  const table = {
    charset: this._charset,
    headers: undefined,
    translations: {},
  };
  let nplurals = 1;
  let msgctxt;

  for (let i = 0, len = tokens.length; i < len; i++) {
    msgctxt = tokens[i].msgctxt || '';

    if (tokens[i].obsolete) {
      table.obsolete ||= {};

      if (!table.obsolete[msgctxt]) {
        table.obsolete[msgctxt] = {};
      }

      delete tokens[i].obsolete;

      table.obsolete[msgctxt][tokens[i].msgid] = tokens[i];

      continue;
    }

    if (!table.translations[msgctxt]) {
      table.translations[msgctxt] = {};
    }

    if (!table.headers && !msgctxt && !tokens[i].msgid) {
      table.headers = parseHeader(tokens[i].msgstr[0]);
      nplurals = parseNPluralFromHeadersSafely(table.headers, nplurals);
    }

    this._validateToken(tokens[i], table.translations, msgctxt, nplurals);

    table.translations[msgctxt][tokens[i].msgid] = tokens[i];
  }

  return table;
};

/**
 * Converts parsed tokens to a translation table
 *
 * @param {Object} tokens Parsed tokens
 * @returns {Object} Translation table
 */
Parser.prototype._finalize = function (tokens) {
  let data = this._joinStringValues(tokens);

  this._parseComments(data);

  data = this._handleKeys(data);
  data = this._handleValues(data);

  return this._normalize(data);
};
