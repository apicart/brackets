import {utils} from '../../shared/utils';
import {macrosRegularExpression} from '../runtime/macros';


var
	openingDelimiter,
	closingDelimiter,

	tokenReplacement,
	textRegularExpression;

/**
 * @param {string} template
 * @return {{macros: [], text: []}}
 */
export function tokenizeTemplate(template) {
	var
		macroTokens = [],
		textTokens = [],
		token,
		tokenArray,
		tokenFullMatch;

	if (template) {
		/* eslint-disable-next-line no-cond-assign */
		while (token = macrosRegularExpression.exec(template)) {
			tokenArray = [];
			tokenFullMatch = token[0];
			token.shift();

			utils.each(token, function (tokenPartKey, tokenPart) {
				if (isNaN(parseInt(tokenPartKey))) {
					return;
				}

				if (typeof tokenPart !== 'undefined') {
					tokenArray.push(tokenPart);
				}
			});

			macroTokens.push(tokenArray);
			template = template.replace(tokenFullMatch, tokenReplacement);
		}

		template = openingDelimiter + template + closingDelimiter;

		/* eslint-disable-next-line no-cond-assign*/
		while (token = textRegularExpression.exec(template)) {
			textTokens.push(token[1]);
			template = template.replace(token[0], '');
		}
	}

	return {
		macros: macroTokens,
		text: textTokens
	};
}


/**
 * @param {{}} config
 */
export function initTemplateTokenizer(config) {
	openingDelimiter = config.delimiters[0];
	closingDelimiter = config.delimiters[1];
	textRegularExpression = new RegExp(openingDelimiter + '((?:.|\n)*?)' + closingDelimiter);
	tokenReplacement = closingDelimiter + openingDelimiter;
}
