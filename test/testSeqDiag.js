#!/home/mpech/install/node/node/out/bin/node
var t=require('./libTest.js').getNew();
var s= require('../seqDiag2Ascii.js');
var e= require('../lib/entities.js');
var fs=require('fs');

(function testActorList(){
  var actors={name:'ActorList', actors:[{name:'C'}]}
  var msg=e.newMessage({name:'A'},{name:'B'},'tes')
  msg.name='Message';
  var note=e.newNote('tes', {name:'D'});
  note.name='Note';
  s.addNode(note).addNode(actors).addNode(msg);
  t.is(s.getActorList(), [{name:'C'},{name:'D'},{name:'A'},{name:'B'}]);
  s.setNodes([]);
})();

(function testMinWidthList(){
  var msg=e.newMessage({name:'A'},{name:'B'},'tes')
  msg.name='Message';
  
  var note=e.newNote('tes', {name:'A'});
  note.name='Note';
  
  var msg2=e.newMessage({name:'B'},{name:'C'},'testicule')
  msg2.name='Message';
  
  var msg3=e.newMessage({name:'C'},{name:'A'},'superMegaLongTextOverkill')
  msg3.name='Message';
  
  s.addNode(note).addNode(msg).addNode(msg2).addNode(msg3);
  var actors=s.getActorList();
  t.is(s.getMinWidths(actors), [11,15]);
  s.setNodes([]);
})();

(function getPadding(){
  var msg=e.newOptional('superMegaLongTextOverkill', []);
  s.addNode(msg);
  s.addNode(msg);
  t.is(s.getPadding([5,6],[{name:'A'},{name:'B'}]),10);
})();

(function(){
  s.configure({
    printer:{
      wsc:' '
    },
    entities:{
      paddingDeeperComposite:1,
      arrowLeftTip:'z'
    }
  });
  function testFile(fname){
    var data=fs.readFileSync('./data/'+fname);
    s.buildFromString(data.toString(), function(err,str){
      if(err){
        //err.failedLines.map(function(x){return 'Syntax failed : '+x}).join(''));
      }
      s.print();
    });
  }
//  testFile('testInAltBigTitle.txt');
//  testFile('testOutAltBigTitle.txt');
//  testFile('webSeqDiagramSample.txt');
//  testFile('resizedByActor.txt');
//  testFile('resizedByMsg.txt');
//  testFile('resizedByNote.txt');
//  testFile('noteLeftOnMostLeftActorInBlock.txt');
//  testFile('noteLeftOnMostLeftActor.txt');
//  testFile('noResizeByNote.txt');
//  testFile('noteRightOnMostLeftActor.txt');
//  testFile('resizedByElseBlock.txt');
//  testFile('multiLine.txt');
  testFile('sample.txt');
//  testFile('sample1.txt');
//    testFile('title.txt');
  try{
//  testFile('testUniqActor.txt');//not supported
  }catch(e){}
})();








