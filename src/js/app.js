import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let functionArgs = $('#input2').val();
        var code = parseCode(codeToParse,functionArgs);
        chart(code);
        //const cfg = esgraph(esprima.parse(codeToParse, { range: true }));
        //const dot = esgraph.dot(cfg, { counter: 0, source: codeToParse });
        //document.getElementById('canvas').innerHTML = dot;

    });
});


//console.log(dot);
function chart (code) {
    document.getElementById('canvas').innerHTML = '';
    var chart;
    //console.log(code);
    if (chart) {
        chart.clean();
    }
    chart = flowchart.parse(code);
    chart.drawSVG('canvas',{'flowstate' : {
        'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
        'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
        'future' : { 'fill' : '#fffbfb'},
        'request' : { 'fill' : 'blue'},
        'invalid': {'fill' : '#444444'},
        'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'Yes', 'no-text' : 'No' },
        'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'Yes', 'no-text' : 'No' }
    }
    });
}

