import { createDefaultStyledParser } from '../src/content/utils/parsers/index.js';

const parser = createDefaultStyledParser();

const testBlock = {
  id: 'test',
  type: 'paragraph',
  data: {
    text: 'This is a test paragraph with <b>bold</b> text.'
  }
};

console.log('Testing paragraph block:');
console.log('Input:', JSON.stringify(testBlock, null, 2));

const result = parser.parseBlock(testBlock);
console.log('Output:', result);
console.log('Type of result:', typeof result);