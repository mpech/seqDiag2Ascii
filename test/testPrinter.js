#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var p= require('../printer.js');
p.configure({
  actors:[{name:'A'},{name:'B'}],
  widths:[4],
  paddingLeft:1,
  paddingRight:2,
  wsc:'-'
});
var line=p.newLine();
t.is(line.s,'-|---|--');
line.override(2,'<==');
t.is(line.s,'-|<==|--');
var left=p.positionOfActor({name:'A'})+1;
var right=p.positionOfActor({name:'B'})-1;
var str=Array(right-left+1);//right-left string length
str='<'+str.join('x');
line.override(left,str);
t.is(line.s,'-|<xx|--');
var line2=p.newLine();
line2.s=line.s;
t.is(p.toString(), '-|<xx|--\n-|<xx|--')
