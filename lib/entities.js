var that={};
module.exports=that;
var _op={
  arrowBody:'-',
  noteHLine:'=',
  noteVerticalLine:'|',
  wsc:' ',
  compositeHLine:'~',
  alternativeMiddleLine:'x',
  paddingDeeperComposite:0,
  arrowLeftTip:'<'
};
that.configure=function(o){
  for(var i in o){
    _op[i]=o[i];
  }
  if(_op.paddingDeeperComposite<0){
    _op.paddingDeeperComposite=0;
    throw "expect paddingDeeperComposite >= 0";
  }
}
that.newMessage=function(a,b,text){
  return new Message(a,b,text);
}
that.newNote=function(text, actor,onLeft){
  return new Note(text, actor,onLeft);
}
that.newAlternative=function(condition, nodes, elseNodes){
  return new Alternative(condition, nodes, elseNodes);
}
that.newOptional=function(condition, nodes){
  return new Optional(condition, nodes);
}
that.newLoop=function(condition, nodes){
  return new Loop(condition, nodes);
}
that.newTitle=function(text){
  return new Title(text);
}
function Abstract(){}
Abstract.prototype.toString=function(){
  return JSON.stringify(this);
}
Abstract.prototype.print=function(printer){
  throw 'print should be implemented';
}

function AbstractLeaf(){
  
}
AbstractLeaf.prototype=new Abstract();
AbstractLeaf.prototype.maxLineWidth=function(){
  return Math.max.apply(null, this.lines.map(function(x){return x.length}));
}
AbstractLeaf.prototype.width=function(){
  return 2+this.maxLineWidth();
}
AbstractLeaf.prototype.traverse=function(cbk){cbk(this);}

AbstractLeaf.prototype.getActors=function(){
  return [];
}
//--------AbstractComposite--------
function AbstractComposite(){
  this.nodes=[];
  this.condition='';
}
AbstractComposite.prototype=new Abstract();
AbstractComposite.prototype.depth=function(){
  var depth=0;
  this.allNodes().forEach(function(entry){
    if(entry instanceof AbstractComposite){
      subDepth=1+entry.depth();
      if(subDepth>depth){
        depth=subDepth;
      }
    }
  });
  return depth;
}
AbstractComposite.prototype.activateBorder=function(printer, left, right){
  printer.addOnNewLine(function(line){
    line.override(left,'|');
    line.override(right,'|');
  });
}
AbstractComposite.prototype.deactivateBorder=function(printer){
  printer.removeOnNewLine();
}
AbstractComposite.prototype.conditionName=function(){
  return this.name;
}
AbstractComposite.prototype.computePadding=function(mostLeftActorName, spaceBetweenActors){
  var minPadding=_op.paddingDeeperComposite;
  var n=0;
  var noteLeftPadding=0;
  this.allNodes().forEach(function(entry){
    if(entry instanceof Note){
      if(entry.leftOrRight=='left' && entry.actor.name==mostLeftActorName){
        noteLeftPadding += entry.width()+1;
      }
    }
  });
  if(noteLeftPadding>minPadding){
    minPadding = noteLeftPadding;
  }
  if(this.getConditionPrinterString().length>spaceBetweenActors+2*minPadding){
    n=this.getConditionPrinterString().length - (spaceBetweenActors+2*minPadding);
    minPadding+=Math.ceil(n/2);
  }
  
  var computedPadding = minPadding;
  //if children have equal or greater padding
  this.allNodes().forEach(function(entry){
    if(entry instanceof AbstractComposite){
      var paddingTemp=entry.computePadding(mostLeftActorName,spaceBetweenActors);
      if(paddingTemp>=computedPadding){
        computedPadding=paddingTemp+1;
      }
    }
  });
  return computedPadding;
}
AbstractComposite.prototype.getConditionPrinterString=function(){
return this.conditionName()+'|['+this.condition+']';
}
AbstractComposite.prototype.print=function(printer){
  var space=printer.mostRightPositionActor() - printer.mostLeftPositionActor();
  var computedPadding=this.computePadding(printer.mostLeftActorName(),space);
  var left=printer.mostLeftPositionActor()-computedPadding;
  var right=printer.mostRightPositionActor()+computedPadding;
  this.activateBorder(printer, left, right);
  this.printHorizontalLine(printer,left, right, _op.compositeHLine);
  var conditionName=this.conditionName();
  var conditionStr=this.getConditionPrinterString();
  printer.newLine().override(left+1, conditionStr);
  printer.newLine().override(left+1, Array(conditionName.length+2).join(_op.compositeHLine));
  
  this.nodes.forEach(function(x){
    x.print(printer);
  });
  
  this.customPrint && this.customPrint(printer, left+1, right-1);
  this.printHorizontalLine(printer,left, right, _op.compositeHLine);
  this.deactivateBorder(printer);
}
AbstractComposite.prototype.printHorizontalLine=function(printer, left, right, symbol){
  printer.newLine().override(left, Array(right-left+2).join(symbol));
}
AbstractComposite.prototype.allNodes=function(){
  return this.nodes;
}
AbstractComposite.prototype.getActors=function(){
  var actors=[];
  this.allNodes().forEach(function(entry){
    actors=actors.concat(entry.getActors());
  });
  return actors;
}
AbstractComposite.prototype.traverse=function(cbk){
  this.allNodes().forEach(function(x){
    x.traverse(cbk);
  });
  cbk(this);
}
//--------Message--------
function Message(a,b,text){
  this.a=a;
  this.b=b;
  this.lines=text.split(/\\n|\n/);
  this.name='message';
}
Message.prototype=new AbstractLeaf();
Message.prototype.print=function(printer){
  var left=printer.positionOfActor(this.a);
  var right=printer.positionOfActor(this.b);
  if(left<right){
    left++;
    right--;
  }else{
    var tmp=left;
    left=right+1;
    right=tmp-1;
  }
  var str=Array(Math.abs(right-left)+1);
  var mostLeft=left;
  if(printer.positionOfActor(this.a)<printer.positionOfActor(this.b)){
    str=str.join(_op.arrowBody)+'>';
  }else{
    str=_op.arrowLeftTip+str.join(_op.arrowBody);
  }
  if(printer.positionOfActor(this.a)!=printer.positionOfActor(this.b)){
    this.lines.forEach(function(line){
      var left=Math.floor((str.length-line.length)/2);
      printer.newLine().override(mostLeft+left,line);
    });
    printer.newLine().override(mostLeft,str);
  }else{
    printer.newLine().override(left,'=');
    this.lines.forEach(function(line){
      printer.newLine().override(left,'|'+line);
    });
    printer.newLine().override(left,_op.arrowLeftTip);
  }
}
Message.prototype.getActors=function(){
  return [this.a, this.b];
}
//--------Note--------
function Note(text, actor,onLeft){
  this.lines=text.split(/\\n|\n/);
  this.actor=actor;
  this.leftOrRight=onLeft=='left'?'left':'right';
  this.name='note';
}
Note.prototype=new AbstractLeaf();
Note.prototype.print=function(printer){
  var pos=printer.positionOfActor(this.actor);
  var hLine=Array(this.width()+1).join(_op.noteHLine);
  var mostLeft=pos+1;
  if(this.leftOrRight=='left'){
    mostLeft=pos-this.width();
  }
  printer.newLine().override(mostLeft,'/'+hLine.substring(1));
  var that=this;
  this.lines.forEach(function(x){
    var textLine=_op.noteVerticalLine+x;
    textLine+=Array(that.width()-(textLine.length)).join(_op.wsc)+_op.noteVerticalLine;
    printer.newLine().override(mostLeft, textLine);
  });
  printer.newLine().override(mostLeft,hLine);
}
Note.prototype.getActors=function(){
  return [this.actor];
}
//--------Title--------
function Title(text){
  this.text=text;
  this.name='title';
}
Title.prototype=new AbstractLeaf();
Title.prototype.print=function(printer){
  printer.newLine({empty:true}).overrideTruncate(this.text, {centered:true});
}
//--------Alternative--------
function Alternative(condition, ifNodes, elseNodes){
  this.condition=condition;
  this.nodes=ifNodes;
  this.elseNodes=elseNodes||[];
  this.name='Alt';
}
Alternative.prototype=new AbstractComposite();
Alternative.prototype.allNodes=function(){
  return this.nodes.concat(this.elseNodes);
}
Alternative.prototype.customPrint=function(printer, left, right){
  if(this.elseNodes.length){
    this.printHorizontalLine(printer, left, right, _op.alternativeMiddleLine);
    this.elseNodes.forEach(function(x){
      x.print(printer);
    });
  }
}

//--------Loop--------
function Loop(condition, nodes){
  this.condition=condition;
  this.nodes=nodes;
  this.name='Loop';
}
Loop.prototype=new AbstractComposite();
//--------Optional--------
function Optional(condition, nodes){
  this.condition=condition;
  this.nodes=nodes;
  this.name='Opt';
}
Optional.prototype=new AbstractComposite();

