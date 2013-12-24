segDiag2Ascii
========

Simple module to plot sequence diagram in ascii fashion.
Similar (but not the same) to websequenceDiagram syntax

examples
========

A basic sample
-------------------------------------------------
sample.txt:

    title This title is not yet handled
    non valid lines are ignored
    note right of A: sciiii
    A->A: Takes a coffee
    alt no coffee left
      A-->B: get me a coffee
      B->A:no
      A->+B: sudo blabla
      B-->-A: :)
    else
      opt sunny day
        A->B: ultimate FRISBEEE???
      end
    end

sample.js:

    #!/usr/bin/env node
    var data=fs.readFileSync('sample.txt');
    require('seqDiag2Ascii').buildFromString(data.toString(), function(){
      s.print();
      /*s.print(function(str){
      
      });*/
    });


***
Output:

<pre><code>
  A                      B  
  |                      |  
  |                      |  
  |/=======              |  
  ||sciiii|              |  
  |========              |  
  |=                     |  
  ||Takes a coffee       |  
  |<                     |  
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
|Alt|[no coffee left]    | |
|~~~~                    | |
| |   get me a coffee    | |
| |--------------------->| |
| |          no          | |
| |z---------------------| |
| |     sudo blabla      | |
| |--------------------->| |
| |          :)          | |
| |z---------------------| |
|xxxxxxxxxxxxxxxxxxxxxxxxxx|
|~~~~~~~~~~~~~~~~~~~~~~~~~~|
||Opt|[sunny day]        |||
||~~~~                   |||
||| ultimate FRISBEEE??? |||
|||--------------------->|||
|~~~~~~~~~~~~~~~~~~~~~~~~~~|
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  |                      |  
  |                      |  
</code></pre>

What about an else in a alt of a loop of an optional in a alt
-------------------------------------------------------------
 
sample1.txt:

    alt want an optional inside
      opt want a loop inside
        loop want a alt inside
          alt want an else
          else
            A->B:You want it you got it
         end
      end
    end

***
output:
<pre><code>
          A                        B      
          |                        |      
          |                        |      
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    |Opt|[want a loop inside]      |     |
    |~~~~ |                        |     |
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    ||Loop|[want a alt inside]     |    ||
    ||~~~~~                        |    ||
    ||~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~||
    |||Alt|[want an else]          |   |||
    |||~~~~                        |   |||
    |||xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|||
    |||   | You want it you got it |   |||
    |||   |----------------------->|   |||
    ||~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~||
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          |                        |      
          |                        |      
</code></pre>

Actors are auto resized
-----------------------
 
resizedByActor.txt:

    A->B:test
    Afezfzef->Bfezfzf:s

***
<pre><code>
    A      B Afezfzef  Bfezfzf 
    |      |     |        |    
    |      |     |        |    
    | test |     |        |    
    |----->|     |        |    
    |      |     |   s    |    
    |      |     |------->|    
    |      |     |        |    
    |      |     |        |    
</code></pre>

options
=======
entities

- arrowBody:'-'
- noteHLine:'='
- noteVerticalLine:'|'
- wsc:' '
- compositeHLine:'~'
- alternativeMiddleLine:'x'
- paddingDeeperComposite:0

printer

- wsc:' ',
- verticalLine:'|'
  
***

Example of usage:
<pre><code>
s.configure({
  printer:{
    wsc:' '
  },
  entities:{
    paddingDeeperComposite:1
  }
});
</pre></code>

installation
============
clone this project from github:

    git clone http://github.com/mpech/seqDiag2Ascii.git

Run tests by hand :)


