/* eslint-disable max-lines-per-function */
var esprima = require('esprima');
var astring  = require('astring');

var define ='';
var paths ='';
var index=0;
var pool=[];
var id=1;
var vardec =false;

function parseCode(codeToParse,stringFunctionArgs) {
    define ='', paths ='', index=0,pool=[], id=1, vardec =false;
    var parsedCode = esprima.parseScript(codeToParse, {loc:true ,range:true});
    var nodes = esprima.parseScript(stringFunctionArgs,{tolerant: true});
    var args = []; // args node
    if(nodes.body.length > 0 ){
        args = nodes.body[0].expression.expressions==undefined? [nodes.body[0].expression] : nodes.body[0].expression.expressions;
        vardec=true;
    }
    args.forEach(x=>pool.push(makeEquation('empty',astring.generate(x))));

    parse_exp(parsedCode,'st','');
    //console.log(define);
    //console.log(paths);
    return define+paths;
}

const makeEquation = (l, r) => ({left: l, right: r});

const getColor=()=>{
    return vardec==false ? '' : ' |approved';
};
const parse_exp = (JsonCode,name,temp,color) =>{
    if(JsonCode==null)
        return;
    var functionsPointers = [parse_BlockStatement,parse_program,parse_FunctionDeclaration,parse_VariableDeclaration,parse_ExpressionStatement,parse_WhileStatement,parse_IfStatement,parse_ReturnStatement];
    var functionType = ['BlockStatement','Program','FunctionDeclaration','VariableDeclaration','ExpressionStatement','WhileStatement','IfStatement','ReturnStatement'];
    var index = functionType.indexOf(JsonCode.type);
    //if(index==-1)
    //  return ;
    //else
    return functionsPointers[index](JsonCode,name,temp,color);
};

const makeDef =(name,type,text)=>{
    define+=name+'=>'+type+ '('+getId()+')'+'\n'+text+ '\n';
};

const getId = ()=>{
    return id++;
};

const connectPath =(from,to,condition)=>{
    paths+=from+condition+'->'+to +'\n';
};

const createNewName = () =>{return 'op'+index++;};
const parse_program = (object,name,end,color) => {
    color=getColor();
    makeDef(name,'start: ','Start'+color);
    var sonName = createNewName();
    connectPath(name,sonName,'');
    object.body.length == 0 ? '' :
        (object.body.map((x)=>parse_exp(x,sonName,end,color)))[0];
};

const parse_WhileStatement = (object,name,end,color) =>{
    var testToEval = astring.generate(object.test);
    var val = null;
    var testName = createNewName();
    var difName =end;
    var bodyName =createNewName();
    var expression = '';
    makeDef(name,'operation: ','Null'+color);
    pool.forEach(x=>expression+='var '+x['left']+' = '+x['right']+'; ');
    expression+=('return '+testToEval+';');
    try {
        val=eval('(function() {' + expression + '})();');
    } catch (e) {e.toString();}
    makeDef(testName,'condition: ',testToEval+color);
    if (val) {
        connectPath(testName,bodyName,'(yes,right)');
        connectPath(testName,difName,'(no,bottom)');
    }
    else{
        color='';
        connectPath(testName,bodyName,'(yes,right)');
        connectPath(testName,difName,'(no,bottom)');
    }

    connectPath(name,testName,'');
    parse_exp(object.body,bodyName,name,color);

};

const parse_IfStatement = (object,name,end,color) => {
    var testText = astring.generate(object.test);
    var val = null;
    var difName =object.alternate == null ? end :createNewName();
    var ditName =createNewName();
    var preTest = '';
    var expression ='';
    pool.forEach(x=>preTest+=' var '+x['left']+' = '+x['right']+';'+'\n');
    expression+=(preTest +'return '+testText+';');
    try {
        val=eval('(function() {' + expression + '}())');
    } catch (e) {e.toString();}
    makeDef(name,'condition: ',testText+color);
    if (val) {
        connectPath(name,ditName,'(yes,bottom)');
        connectPath(name,difName,'(no,right)');
        parse_exp(object.consequent,ditName,end,color) ;
        parse_exp(object.alternate,difName,end,'');
    }
    else {
        connectPath(name,ditName,'(yes,right)');
        connectPath(name,difName,'(no,bottom)');
        parse_exp(object.consequent,ditName,end,'') ;
        parse_exp(object.alternate,difName,end,color);
    }


};

const parse_FunctionDeclaration = (object,name,end,color) => {
    var argsNames = object.params;
    var i=0;
    try {
        pool.forEach(x => {
            x['left'] = argsNames[i++].name;
        });
    }catch(e){e.toString();}
    var lets = object.body.body.filter(x=>x.type=='VariableDeclaration');
    var filteredBody = object.body.body.filter(x=>x.type!='VariableDeclaration');
    var letText = '';
    lets.forEach(x=>(x.declarations.forEach(y=>pool.push(makeEquation(y.id.name,y.init==null? '':astring.generate(y.init))))));
    lets.forEach(x=>(x.declarations.forEach(y=>letText+=astring.generate(y)+'\n')));
    makeDef(name,'operation: ',letText+color);
    object.body.body=filteredBody;
    var sonName = 'op'+index++;
    connectPath(name,sonName,'');
    return parse_exp(object.body,sonName,end,color);

};

const parse_ExpressionStatement = (object,name,end,color) =>{
    var text = astring.generate(object)+color;
    makeDef(name,'operation: ',text);
    connectPath(name,end,'');
};

// const parse_AssignmentExpression = (object,name,end,color) =>{
//     var text = astring.generate(object)+color;
//     makeDef(name,'operation: ',text);
//     connectPath(name,end,'');
// };

const parse_ReturnStatement = (object,name,end,color) =>{
    makeDef(name,'end: ',astring.generate(object)+color);
};

const parse_BlockStatement = (object,name,end,color) =>{
    //var expressionStatement = object.body.filter((x=> x.type=='VariableDeclaration'));
    var me =name;
    var body =object.body; //object.body.filter(x=> x.type!='VariableDeclaration' );
    var nextelement=body.length==0? end : 'op'+index++;
    // if(expressionStatement.length>0){
    //     var letText='';
    //     expressionStatement.forEach(x=> letText+=astring.generate(x)+'\n');
    //     makeDef(me,'operation: ',letText+color+'\n');
    //     connectPath(me,nextelement,'');
    //     me=nextelement;
    //     nextelement='op'+index++;
    // }

    var temp = end==''? nextelement : end ;
    var j=1;
    var size = body.length;
    body.forEach(x=>{
        //connectPath(name,temp,'');
        if(j++==size)
            parse_exp(x,me,temp,color);
        else{
            parse_exp(x,me,nextelement,color);
        }
        me=nextelement;
        nextelement='op'+index++;
    });
};

const parse_VariableDeclaration = (object,name,end,color) =>{
    makeDef(name,'operation: ',astring.generate(object)+color);
    connectPath(name,end,'');
};

export {parseCode };


//let parse = parseCode('function foo (x) { let a = b; x = a;return x;  }','1 , 2');

//console.log(esprima.parseScript(parse['code']));
//console.log(parse['code']);
//let parse = parseCode(code, '1,1,11');
//const cfg = esgraph(parse(code2, { comment: true, range: true }););
//const dot = esgraph.dot(cfg, { counter: 0, source: code3 });
//console.log(eval(a));
//console.log(parse);