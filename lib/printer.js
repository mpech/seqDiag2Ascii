var that={}
module.exports=that;
var _op={
  paddingLeft:0,
  paddingRight:0,
  actors:[],//ordered, uniq
  widths:[],
  wsc:' ',
  verticalLine:'|'
};
var _onNewLineCbks=[];
var _lineWidth=0;
var _lines=[];
that.configure=function(o){
  for(var i in o){
    _op[i]=o[i];
  }
  if(o.actors){
    if(o.actors.length-1!=o.widths.length){
      throw 'actors:'+(o.actors.length)+',widths:'+o.widths.length+'/expect to have distance between actors'
    }
    _op.actors=o.actors.map(function(actor){
      return {name:actor.name}
    });
    if(_op.actors.length==0){
      return;
    }
    _op.actors[0].position=_op.paddingLeft;
    //add 1 for one single actor
    _lineWidth=_op.paddingLeft+_op.paddingRight+_op.widths.reduce(function(a,b){return a+b})+1;
    for(var i=1;i<_op.actors.length;++i){
      _op.actors[i].position=_op.actors[i-1].position+_op.widths[i-1];
    }
  }
}
that.flush=function(){
  _lines=[];
}
that.mostLeftActorName=function(){
  return _op.actors[0].name;
}
that.mostLeftPositionActor=function(actor){
  return _op.actors[0].position;
}
that.mostRightPositionActor=function(actor){
  return _op.actors.slice(-1)[0].position;
}
that.positionOfActor=function(actor){
  var actor= getActor(actor);
  return actor.position;
}
that.width=function(actorA,actorB){
  return Math.abs(getActor(actorA).position - getActor(actorB).position);
}
that.addOnNewLine=function(cbk){
  _onNewLineCbks.push(cbk);
}

that.removeOnNewLine=function(){
  _onNewLineCbks.pop();
}
that.newLine=function(){
  var str=Array(_lineWidth);
  _op.actors.forEach(function(x){
    str[x.position]=_op.verticalLine;
  });
  var reg=new RegExp(_op.wsc+'\\'+_op.verticalLine,'g');
  //remove width between actors, plus add one for paddingLeft
  str=str.join(_op.wsc).replace(reg,_op.verticalLine);
  var line=new Line(_op.wsc+str);
  _lines.push(line);
  _onNewLineCbks.forEach(function(cbk){cbk(line)});
  return line;
}
that.toString=function(){
  return _lines.map(function(line){return line.s}).join('\n');
}
function Line(s){
  this.s=s;
}
Line.prototype.override=function(index, str){
  this.s=this.s.substring(0, index)+str+this.s.substring(index+str.length);
}
function getActor(actor){
  return _op.actors.filter(function(x){
    return x.name==actor.name;
  })[0];
}
