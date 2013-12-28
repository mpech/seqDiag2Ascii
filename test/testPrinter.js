#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var p= require('../lib/printer.js');
p.configure({
  actors:[{name:'A'},{name:'B'}],
  widths:[4],
  paddingLeft:1,
  paddingRight:2,
  wsc:'-'
});
(function newLine(){
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
  
  
  p.flush();
  var line=p.newLine();
  var line2=p.newLine({empty:true});
  t.is(line.s.length, line2.s.length);
})();
(function overrideTruncate(){
  var line=p.newLine();
  line.overrideTruncate('title');
  t.is(line.s, 'title|--');
  
  line=p.newLine();
  line.overrideTruncate('title',{centered:true});
  t.is(line.s, '-title--');
  
  line=p.newLine({empty:true});
  line.overrideTruncate('title',{centered:true, left:2});
  t.is(line.s, '--t...--');
  
  line=p.newLine();
  line.overrideTruncate('titleLong',{centered:true});
  t.is(line.s, 'title...');
  
  line=p.newLine({empty:true});
  line.overrideTruncate('A',{centered:true, left:2});
  t.is(line.s, '--A-----');
  
  line=p.newLine({empty:true});
  line.overrideTruncate('someLongTitle',{centered:true});
  t.is(line.s, 'someL...');
  
  line=p.newLine({empty:true});
  line.overrideTruncate('Awesome',{left:2});
  t.is(line.s, '--Awe...');
})();
