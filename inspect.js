#!/usr/bin/env nodejs

var GRAMMAR_PATHS = [
    'syntaxes/jinja2.tmLanguage.json',
    'fixtures/html2.json'
];
var FILE_PATH = 'demo.jinja2'

process.env['VSCODE_TEXTMATE_DEBUG'] = true;

var Registry = require('vscode-textmate').Registry;
var registry = new Registry();

console.log('LOADING GRAMMAR: ' + GRAMMAR_PATHS[0]);
var grammar = registry.loadGrammarFromPathSync(GRAMMAR_PATHS[0]);
for (var i = 1; i < GRAMMAR_PATHS.length; i++) {
    console.log('LOADING GRAMMAR: ' + GRAMMAR_PATHS[i]);
    registry.loadGrammarFromPathSync(GRAMMAR_PATHS[i]);
}

var fileContents = require('fs').readFileSync(FILE_PATH).toString();
var lines = fileContents.split(/\r\n|\r|\n/);
var ruleStack = null;
var lastElementId = 0;
for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    console.log('');
    console.log('');
    console.log('===========================================');
    console.log('TOKENIZING LINE ' + (i + 1) + ': |' + line + '|');

    var r = grammar.tokenizeLine(line, ruleStack);

    console.log('');

    var stackElement = r.ruleStack;
    var cnt = 0;
    while (stackElement) {
        cnt++;
        stackElement = stackElement._parent;
    }

    console.log('@@LINE END RULE STACK CONTAINS ' + cnt + ' RULES:');
    stackElement = r.ruleStack;
    var list = [];
    while (stackElement) {
        if (!stackElement._instanceId) {
            stackElement._instanceId = (++lastElementId);
        }
        var ruleDesc = grammar._ruleId2desc[stackElement._ruleId]
        if (!ruleDesc) {
            list.push('  * no rule description found for rule id: ' + stackElement._ruleId);
        } else {
            list.push('  * ' + ruleDesc.debugName + '  -- [' + ruleDesc.id + ',' + stackElement._instanceId + '] "' + stackElement._scopeName + '"');
        }
        stackElement = stackElement._parent;
    }
    list.reverse();
    console.log(list.join('\n'));

    ruleStack = r.ruleStack;
}
