/********************************************************************************************************************************************************** 
source code
-name:	divLinkedList
-type: 	javascript	: global self loading script (Not JSON-Script compliant)
-vers:	alpha 1 (18 Dec 2011)
-Discription:	Takes advantage of the native node linkedList properties of DOM, to act as an array linkedList

jsClass, is required for this script
[http://pic-o.com/blog/2011/08/jsclass/]

Please ensure jsCompatible, is loaded prior to this script, to make this cross-client safe
[http://pic-o.com/blog/2011/08/jscompatible/]

-Example Usage:

-Main refrences:
http://en.wikipedia.org/wiki/Linked_list
https://developer.mozilla.org/en/DOM/Node

-Website:
[http://pic-o.com/blog/2011/08/divlinkedlist/]

-ToDo:
Accessor and iteration methods (ARRAY FUNCTIONS)
Fallback non div / dom method. (for node.js)

*************************************************************** Author Details & CopyRight ****************************************************************
author: 	picoCreator
email:		pico.creator@gmail.com
website:	blog.pic-o.com
copyright:	cc by [CreativeCommons Attribution licenses]
			http://creativecommons.org/licenses/by/3.0/

cc notes:	
	+ Crediting me (Eugene Cheah AKA picoCreator) is required for derivatives of this work, UNLESS...
	+ An exception is given for using this on a live website, (eg, using this for your blog in the background) in which crediting every single source file directly may be impractical (even for commercial sites). 
	However this exception is only given if you drop me an email, with the link to deployment.
	+ This exception however does not hold in any source release of which this code is used (Its stated in the cc license btw), hence credit should be given in this case.
	+ These license requirments would be applied to all forks / merges / derivatives, of this work.

additional notes:
	+ I may update to add an additional open source licenses in the future / on requested =)
	+ Remember to drop an email if you are using this for a live site, ty. (for my curiosity, to see where this code goes)
**********************************************************************************************************************************************************/

/**************************************************************
* Javascript LinkedList -> Requires jsClass.js (class engine) *
**************************************************************/
(function(){
	if(!this.Class) {
		throw( new Error('divLinkedList : Unable to find central class engine : Ensure it is loaded first (https://github.com/pic-o/jsClass)') );
	}
	
	if(!this.divLinkedList) {
		//console.log('linkedListCreated');
		this.divLinkedList = Class._extend(
			{
				/**************************************************
				* Attaches the zoomBox controls to the dom target *
				**************************************************/
				_init : function( domObj ) {
				
					function isNode(o)	{	
						return (
							typeof Node === "object" ? o instanceof Node : 
							typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
						);
					}
					
					if(isNode(domObj)) {
						if( domObj._asac_divLinkedList ) {
							if( domObj._asac_divLinkedList instanceof asac.dataStruct.divLinkedList ) {
								return domObj._asac_divLinkedList;
							} 
						} //else {
					}
					
					if(!domObj || !(isNode(domObj)) ) {
						domObj = document.createElement('div');
					}
					domObj._asac_divLinkedList = this;
					this.domTar = domObj;
				},
				
				//Child type, for all nested (linked list) dom nodes
				childType : 'div',
				
				//Child property value, utalize by linkedlist
				childProp : 'rawData',
				
				//Filters the index, into a valid value (fixes it between the lower and upper limit), and returns it
				indexFix : function( index ) {
					var len = this.domTar.childNodes.length;
					if(index >= len) {
						return null;
					}
					if(index < 0) {
						index = len + index;
						if(index < 0) {
							return null; //out of bounds
						}
					}
					return index;
				},
				
				//Gets the internal dom node that holds the data (fixes to lower and upper limit)
				getDomNode : function( index ) {
					index = this.indexFix( index );
					
					if( index === null ) {
						return null;
					}
					//Micro optimisations
					if(index === 0) {
						return this.domTar.firstChild;
					}
					if( (index + 1) == this.domTar.childNodes.length ) {
						return this.domTar.lastChild;
					}
					//to be optimized
					return this.domTar.childNodes[index];
				},
				
				//Gets the internal dom node if it exists, else creates it (creation only occurs to positive index)
				_genDomNode : function( index ) {
					var len = this.domTar.childNodes.length;
					if(index >= len) {
						var count = index - len + 1;
						var paren = this.domTar;
						var buffe = null;
						var dType = this.childType;
						for(var a = 0; a < count; a++) {
							buffe = document.createElement(dType);
							paren.appendChild( buffe );
						}
						return buffe;
					} //else
					return this.getDomNode( index );
				},
				
				//Gets the stored data at index
				gets : function( index ) {
					var node = this.getDomNode(index);
					if( node ) {
						return node[this.childProp];
					} //else
					return null;
				},
				
				//Sets the stored data at index
				sets : function( index, value ) {
					var node = this._genDomNode( index );
					if( node ) {
						node[ this.childProp ] = value;
						return value;
					}
					return null;
				},
				
				//Returns the array length, else truncates the array to the specified length
				length : function( len ) {
					if( len !== null ) {
						var parent = this.domTar;
						var buffer = null;
						if( len === 0 ) {
							buffer = parent.firstChild;
							while( buffer ) {
								parent.removeChild( buffer );
								buffer = parent.firstChild;
							}
							return 0;
						}
						
						if( len < 0 ) {
							buffer = this.getDomNode( len );
						} else {
							buffer = this._genDomNode( len );
						}
						
						if( buffer ) {
							buffer = buffer.nextSibling;
							while( buffer ) {
								parent.removeChild( buffer );
								buffer = buffer.nextSibling;
							}
						}
					} //else
					return this.domTar.childNodes.length;
				},
				
				//Get the value of the node, and removes it
				_getAndRemove : function( dom ) {
					if( dom ) {
						var value = dom[ this.childProp ];
						this.domTar.removeChild( dom );
						return value;
					}
					return null;
				},
				
				//Inserts the array of values before the dom node
				_insertsBefore : function( dom, arr ) {
					var par = this.domTar;
					var buf = null;
					var dType = this.childType;
					var pType = this.childProp;
					for( var a = 0; a < arr.length; a++ ) {
						buf = document.createElement(dType);
						buf[ pType ] = arr[a];
						par.insertBefore(buf , dom);
					}
				},
				
				/*******************************************
				*	Traditional array functions
				*******************************************/
				pop : function() {
					return this._getAndRemove(this.domTar.lastChild);
				},
				
				push : function() {
					var args = Array.prototype.slice.call(arguments);
					
					var parent = this.domTar;
					var dType = this.childType;
					var pType = this.childProp;
					var buffer = null;
					for( var a = 0; a < args.length; a++ ) {
						buffer = document.createElement(dType);
						buffer[ pType ] = args[a];
						parent.appendChild( buffer );
					}
					return this.domTar.childNodes.length;
				},
				
				reverse : function() {
					throw( new Error('divLinkedList.reverse() : is currently unsupported') );
					//return null;
				},
				
				shift : function() {
					return this._getAndRemove(this.domTar.firstChild);
				},
				
				sort : function() {
					throw( new Error('divLinkedList.sort() : is currently unsupported') );
					//return null;
				},
				
				splice : function() {
					var args = Array.prototype.slice.call(arguments);
					if( args.length < 2 ) { 
						throw( new Error('divLinkedList.splice() : supports a minimum of 2 argmunets') );
						//return null;
					}
					var ref = this.getDomNode( args[0] ); //index node
					
					if(ref == null) {
						throw( new Error('divLinkedList.splice() : invalid index') );
						//return null;
					}
					
					var par = this.domTar;
					function nxtNode( dom ) {
						if( dom ) {
							return dom.nextSibling;
						} //else
						return par.firstChild; //(index -> 0)
					}
					
					ref = ref.previousSibling; //gets the point before index
					var pType = this.childProp;
					var buffer;
					var ret = [];
					
					//Deletes all nodes (as accounted) after the point before index
					for( var a = 0; a < args[1]; a++ ) {
						buffer = nxtNode( ref );
						if( buffer ) {
							ret.push( buffer[ pType ] );
							par.removeChild( buffer );
						} else {
							break;
						}
					}
					
					if( ref ) {
						ref = ref.nextSibling; //Gets the index point (to insert whthin)
					} else {
						ref = par.firstChild; //gets the first item (index -> 0)
					} //if ref == null -> appends at the end
					this._insertsBefore( ref, args.slice(2) );
					
					return ret;
				},
				
				unshift : function() {
					var args = Array.prototype.slice.call(arguments);
					this._insertsBefore( this.domTar.firstChild, args );
					return this.domTar.childNodes.length;
				},
				
				//Accessor methods
				//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
				"concat" : function() {
					throw( new Error('divLinkedList.concat() : is currently unsupported') );
					//return null;
				},
				
				"join" : function() {
					throw( new Error('divLinkedList.join() : is currently unsupported') );
					//return null;
				},
				
				"slice" : function() {
					throw( new Error('divLinkedList.slice() : is currently unsupported') );
					//return null;
				},
				
				"toString" : function() {
					throw( new Error('divLinkedList.toString() : is currently unsupported') );
					//return null;
				},
				
				indexOf : function(data, fromIndex, useDiv) {
					//throw( new Error('divLinkedList.indexOf() : is currently unsupported') );
					var node;
					
					if( fromIndex ) {
						fromIndex = this.indexFix( fromIndex );
						node = this.getDomNode( fromIndex );
					} else {
						fromIndex = 0;
						node = this.domTar.firstChild;
					}
					
					var count = 0;
					
					//micro optimising of -> if(useDiv) -> while loop
					if(useDiv === true) {
						while( node ) {
							if( node === data ) {
								return (fromIndex + count);
							}
							
							count++;
							node = node.nextSibling;
						}
					} else {
						var cProp = this.childProp;
						while( node ) {
							if( node[cProp] === data ) {
								return (fromIndex + count);
							}
							
							count++;
							node = node.nextSibling;
						}
					}
					
					return -1;
					
					//return null;
				},
				
				"lastIndexOf" : function() {
					throw( new Error('divLinkedList.lastIndexOf() : is currently unsupported') );
					//return null;
				},
				
				//Iteration methods
				//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
				"filter " : function() {
					throw( new Error('divLinkedList.filter () : is currently unsupported') );
					//return null;
				},
				
				every : function( callback, thisObj, startIndex, limit) {
					var res = true;
					var test;
					
					if(!thisObj) { thisObj = this; }
					var prop = this.childProp;
					var node;
					
					if( startIndex ) {
						node = this.getDomNode( startIndex );
					} else {
						node = this.domTar.firstChild;
					}
					
					var count = 0;
					while(node) {
						if(limit && limit <= count) { return res; }
						test = callback.call( thisObj, node[prop], count, this);
						count++;			
						if(test === false) { return false; }
						if(res === true && test !== true) {
							res = null;
						}
						node = node.nextSibling;
					}
					
					return res;
				},
				
				forEach : function(  callback, thisObj, startIndex, limit) {
					var test;
					
					if(!thisObj) { thisObj = this; }
					var prop = this.childProp;
					var node;
					
					if( startIndex ) {
						node = this.getDomNode( startIndex );
					} else {
						node = this.domTar.firstChild;
					}
					
					var count = 0;
					while(node) {
						if(limit && limit <= count) { return; }
						callback.call( thisObj, node[prop], count, this);
						count++;			
						
						node = node.nextSibling;
					}
					
					return;
				},
				
				"map" : function() {
					throw( new Error('divLinkedList.map() : is currently unsupported') );
					//return null;
				},
				
				"some" : function() {
					throw( new Error('divLinkedList.some() : is currently unsupported') );
					//return null;
				},
				
				"reduce" : function() {
					throw( new Error('divLinkedList.reduce() : is currently unsupported') );
					//return null;
				},
				
				"reduceRight" : function() {
					throw( new Error('divLinkedList.reduce() : is currently unsupported') );
					//return null;
				}
			}
		);
	}

})();