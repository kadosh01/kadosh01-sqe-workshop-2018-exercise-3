import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        //console.log(parseCode('','')['code']);
        assert.equal(
            parseCode('',''),'st=>start: (1)\nStart\nst->op0\n');
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            (parseCode('let a;','')), 'st=>start: (1)\nStart\nop0=>operation: (2)\nlet a;\nst->op0\nop0->\n'
        );
    });

    it('is parsing a simple while loop correctly', () => {
        assert.equal(
            parseCode('while (low >0) {i=i+1; }',''),'st=>start: (1)\nStart\nop0=>operation: (2)\nNull\nop1=>condition: (3)\nlow > 0\nop2=>operation: (4)\ni = i + 1;\nst->op0\nop1(yes,right)->op2\nop1(no,bottom)->\nop0->op1\nop2->op0\n'
        );
    });

    it('is parsing a simple function correctly', () => {
        //console.log(parseCode('function foo (x) { x = x +1; return x;  }','1')['code']);
        assert.equal(parseCode('function foo () { c = x +1; return c;  }',''), 'st=>start: (1)\nStart\nop0=>operation: (2)\n\nop1=>operation: (3)\nc = x + 1;\nop2=>end: (4)\nreturn c;\nst->op0\nop0->op1\nop1->op2\n'
        );
    });

    it('is parsing a empty function correctly', () => {
        assert.equal(parseCode('function foo () { }',''), 'st=>start: (1)\nStart\nop0=>operation: (2)\n\nst->op0\nop0->op1\n'
        );
    });
    //////////////
    it('is parsing a simple function 2 correctly', () => {
        //console.log(parseCode('function foo (x) { x = x +1; return x;  }','1')['code']);
        assert.equal(
            parseCode('function foo (x) { let a = 1; let a = 2;x = a ; return x;  }','1'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\na = 1\na = 2\n |approved\nop1=>operation: (3)\nx = a; |approved\nop2=>end: (4)\nreturn x; |approved\nst->op0\nop0->op1\nop1->op2\n'
        );
    });

    it('is parsing a simple function 3 correctly', () => {
        assert.equal(
            parseCode('function foo (x , y) { let a = y+2; x = a + 1 ; return x * y;  }','1,2'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\na = y + 2\n |approved\nop1=>operation: (3)\nx = a + 1; |approved\nop2=>end: (4)\nreturn x * y; |approved\nst->op0\nop0->op1\nop1->op2\n'
        );
    });

    it('is parsing a simple function with if statement correctly', () => {
        assert.equal(
            parseCode('function foo (x , y) { let a = y+2; if(a>0) {x = a + 1 ; return x * y;}  }','1,2'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\na = y + 2\n |approved\nop1=>condition: (3)\na > 0 |approved\nop3=>operation: (4)\nx = a + 1; |approved\nop4=>end: (5)\nreturn x * y; |approved\nst->op0\nop0->op1\nop1(yes,bottom)->op3\nop1(no,right)->op2\nop3->op4\n'
        );
    });

    it('is parsing a simple function with while statement correctly', () => {
        assert.equal(
            parseCode('function foo (x , y) { let a = y+2; while(a>0) {let f=2; x = a + 1 ; return x * y;}  }','1,2'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\na = y + 2\n |approved\nop1=>operation: (3)\nNull |approved\nop3=>condition: (4)\na > 0 |approved\nop4=>operation: (5)\nlet f = 2; |approved\nop5=>operation: (6)\nx = a + 1; |approved\nop6=>end: (7)\nreturn x * y; |approved\nst->op0\nop0->op1\nop3(yes,right)->op4\nop3(no,bottom)->op2\nop1->op3\nop4->op5\nop5->op6\n'
        );
    });

    it('is parsing a simple function statement with while body correctly', () => {
        assert.equal(
            parseCode('let b = 4; \n function foo (x , y) { let a = y+2; while(x) {x = b * a ; return x * y;}  }',' true,"f",[1,2]'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\nlet b = 4; |approved\nop0=>operation: (3)\na = y + 2\n |approved\nop1=>operation: (4)\nNull |approved\nop3=>condition: (5)\nx |approved\nop4=>operation: (6)\nx = b * a; |approved\nop5=>end: (7)\nreturn x * y; |approved\nst->op0\nop0->\nop0->op1\nop3(yes,right)->op4\nop3(no,bottom)->op2\nop1->op3\nop4->op5\n'
        );
    });


    it('is parsing a simple complexity code correctly', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                '    let e ;\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n','1,2,31'), 'st=>start: (1)\nStart |approved\nop0=>operation: (2)\ne\na = x + 1\nb = a + y\nc = 0\n |approved\nop1=>condition: (3)\nb < z |approved\nop4=>operation: (4)\nc = c + 5;\nop5=>end: (5)\nreturn x + y + z + c;\nop3=>condition: (6)\nb < z * 2 |approved\nop9=>operation: (7)\nc = c + x + 5;\nop10=>end: (8)\nreturn x + y + z + c;\nop8=>operation: (9)\nc = c + z + 5; |approved\nop13=>end: (10)\nreturn x + y + z + c; |approved\nst->op0\nop0->op1\nop1(yes,right)->op4\nop1(no,bottom)->op3\nop4->op5\nop3(yes,right)->op9\nop3(no,bottom)->op8\nop9->op10\nop8->op13\n'
        );
    });
});
