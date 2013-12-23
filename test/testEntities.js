#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var e= require('../lib/entities.js');
var p= require('../lib/printer.js');
(function NoteOnRight(){
  p.configure({
    actors:[{name:'A'},{name:'B'}],
    widths:[11],
    paddingLeft:3,
    paddingRight:2,
    wsc:'-'
  });
  e.configure({
    arrowBody:'*'
  });
  var msg=e.newMessage({name:'A'},{name:'B'},'tes');
  msg.print(p);
  t.is(p.toString(), '---|---tes----|--\n---|*********>|--')
  var msg=e.newMessage({name:'A'},{name:'A'},'test2');
  msg.print(p);

  var note=e.newNote('Yes\nDude\\nROCKS', {name:'A'});
  note.print(p);
  var note=e.newNote('Other\ntest', {name:'B'},'right');
  note.print(p);
  
  var alternative=e.newAlternative('test', [msg], [note]);
  alternative.print(p);
  
  var optional=e.newOptional('hello?', [msg, note]);
  optional.print(p);
  
  var loop=e.newLoop('big condition there', [msg]);
  loop.print(p);
  
  var loopInOptional=e.newOptional('hello', [loop]);
  loopInOptional.print(p);
})();
(function traverse(){
  p.configure({
    actors:[{name:'A'},{name:'B'}],
    widths:[11],
    paddingLeft:3,
    paddingRight:2,
    wsc:'-'
  });
  e.configure({
    arrowBody:'*'
  });
  var msg=e.newMessage({name:'A'},{name:'B'},'tes');
  var note=e.newNote('Yes\nDude\\nROCKS', {name:'A'});
  var alternative=e.newAlternative('test', [msg], [note]);
  
  var optional=e.newOptional('hello?', [alternative,msg]);
  var nodes=[];
  optional.traverse(function(node){
    if(node.name=='message'){
      nodes.push(node);
    }
  });
  t.is(nodes.length,2);
})();

