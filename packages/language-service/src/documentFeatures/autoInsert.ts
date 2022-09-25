import type { DocumentServiceRuntimeContext } from '../types';
import { documentArgFeatureWorker } from '../utils/featureWorkers';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { LanguageServicePlugin } from '@volar/language-service';
import * as vscode from 'vscode-languageserver-protocol';

export function register(context: DocumentServiceRuntimeContext) {

	return (document: TextDocument, position: vscode.Position, options: Parameters<NonNullable<LanguageServicePlugin['doAutoInsert']>>[2]) => {

		return documentArgFeatureWorker(
			context,
			document,
			position,
			sourceMap => true,
			function* (position, sourceMap) {
				for (const [mappedRange] of sourceMap.getMappedRanges(
					position,
					position,
					data => !!data.completion,
				)) {
					yield mappedRange.start;
				}
			},
			(plugin, document, position) => plugin.doAutoInsert?.(document, position, options),
			(data, sourceMap) => {

				if (!sourceMap)
					return data;

				if (typeof data === 'string')
					return data;

				const range = sourceMap.getSourceRange(data.range.start, data.range.end)?.[0];

				if (range) {
					data.range = range;
					return data;
				}
			},
		);
	};
}
