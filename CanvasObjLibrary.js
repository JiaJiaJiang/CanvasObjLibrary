/*
CopyRight(Left) iTisso
CC 3.0
member:LuoJia
*/
function newC_GUI() {
	var C_GUI = {
		keys: new Array(),
		/*被绘制的canvas*/
		canvas: null,
		/*canvas的绘图上下文*/
		context: null,
		buffercanvas: null,
		buffercontext: null,
		currentcontext: null,
		mouseleft: false,
		mouseright: false,
		mousecenter: false,
		mouseX: null,
		mouseY: null,
		imageSmoothing: true,
		focus: null,
		canvasonfocus: false,
		document: null,
		onoverElement: null,
		eve: new Object,

		imageSmoothing: {
			on: function() {
				if (C_GUI.buffercontext) C_GUI.buffercontext.imageSmoothingEnabled = true;
				C_GUI.context.imageSmoothingEnabled = true;
			},
			off: function() {
				if (C_GUI.buffercontext) C_GUI.buffercontext.imageSmoothingEnabled = false;
				C_GUI.context.imageSmoothingEnabled = false;
			}
		},

		/*重设位置(为鼠标坐标服务)【当canvas的位置改变(dom中)时需要调用，来修正鼠标坐标】*/
		setrelPosition: function() {
			switch (C_GUI.tools.getBrowser()) {
			case "msie":
			case "opera":
				{
					C_GUI.mousePosition.fun = C_GUI.mousePosition.ie;
					C_GUI.mousePosition.offsetx = C_GUI.tools.getnum(canvas.style.borderLeftWidth);
					C_GUI.mousePosition.offsety = C_GUI.tools.getnum(canvas.style.borderTopWidth) / 2;
					break;
				}
			case "chrome":
			default:
				{
					C_GUI.mousePosition.offsety = C_GUI.tools.getnum(canvas.style.borderTopWidth) / 2;
					C_GUI.mousePosition.fun = C_GUI.mousePosition.chrome;
					break;
				}
			case "firefox":
				{
					C_GUI.mousePosition.fun = C_GUI.mousePosition.firefox;
					C_GUI.mousePosition.offsety = C_GUI.canvas.offsetTop + C_GUI.tools.getnum(canvas.style.borderTopWidth) / 2;
					C_GUI.mousePosition.offsetx = C_GUI.canvas.offsetLeft;
					break;
				}
			}

		},

		/*创建图形用的画布*/
		imagecreater: {
			creatercanvas: null,
			creatercontext: null,
			init: function() {
				C_GUI.imagecreater.creatercanvas = document.createElement("canvas");
				C_GUI.imagecreater.creatercontext = C_GUI.imagecreater.creatercanvas.getContext("2d");
			},
			drawpic: function(width, height, _draw) {
				if (!C_GUI.imagecreater.creatercontext) C_GUI.imagecreater.init();
				var ct = C_GUI.imagecreater.creatercontext,
				cv = C_GUI.imagecreater.creatercanvas;
				C_GUI.imagecreater.creatercanvas.width = width;
				C_GUI.imagecreater.creatercanvas.height = height;
				_draw(ct);
				var c = document.createElement("canvas");
				c.width = width,
				c.height = height;
				c.getContext("2d").drawImage(cv, 0, 0);
				return c;
			}
		},

		/*设置被绘制的画布*/
		setCanvas: function(canvas_dom) {
			C_GUI.canvas = canvas_dom;
			C_GUI.setrelPosition();

			var ev = C_GUI.e;
			C_GUI.eve.stopPropagation = function() {
				C_GUI.eve.Propagation = false;
			};
			var aEL = C_GUI.tools.addEventListener;
			aEL(canvas_dom, "mouseover",
			function(e) {
				C_GUI.canvasonfocus = true;
			});
			aEL(canvas_dom, "mousemove",
			function(e) {
				e.preventDefault();
				C_GUI.eve.target = C_GUI.onoverElement;
				C_GUI.mousePosition.fun(e);
				ev.mousemove(C_GUI.eve);
			});
			aEL(canvas_dom, "mousedown",
			function(e) {
				e.preventDefault();
				C_GUI.eve.Propagation = true;
				C_GUI.eve.target = C_GUI.onoverElement;
				C_GUI.eve.button = e.button;
				ev.mousedown(C_GUI.eve);
			});
			aEL(canvas_dom, "mouseout",
			function() {
				ev.mouseoutcanvas();
			});
			aEL(canvas_dom, "contextmenu",
			function(e) {
				e.preventDefault();
			});
			aEL(canvas_dom, "selectstart",
			function(e) {
				e.preventDefault();
			});
			aEL(window, "mouseout",
			function() {
				ev.mouseoutcanvas();
			});

			aEL(canvas_dom, "resize",
			function() {
				canvas_dom.width = C_GUI.width = canvas_dom.offsetWidth;
				canvas_dom.height = C_GUI.height = canvas_dom.offsetHeight;
				if (C_GUI.buffercanvas) {
					C_GUI.buffercanvas.width = canvas_dom.offsetWidth;
					C_GUI.buffercanvas.height = canvas_dom.offsetHeight;
				}
				C_GUI.setPosition();
			});

			aEL(canvas_dom, "mouseup",
			function(e) {
				C_GUI.eve.Propagation = true;
				C_GUI.eve.target = C_GUI.onoverElement;
				C_GUI.eve.button = e.button;
				ev.mouseup(C_GUI.eve);
			});
			aEL(canvas_dom, "mousewheel",
			function(e) {
				e = e || window.event;
				C_GUI.eve.Propagation = true;
				C_GUI.eve.target = C_GUI.onoverElement;
				var data = e.wheelDelta ? e.wheelDelta: e.detail;
				if (data == -3 || data == 120) {
					C_GUI.eve.wheel = 0;
				} else if (data == 3 || data == -120) {
					C_GUI.eve.wheel = 1;
				}
				ev.mousewheel(C_GUI.eve);
			});
			aEL(window, "keydown",
			function(e) {
				if (C_GUI.canvasonfocus) {

					if (!C_GUI.keys[e.keyCode]) {
						e.preventDefault();
						C_GUI.eve.Propagation = true;
						C_GUI.eve.keyCode = e.keyCode;
						ev.keydown(C_GUI.eve);
					}
				}
			});
			aEL(window, "keyup",
			function(e) {
				if (C_GUI.canvasonfocus) {
					if (C_GUI.keys[e.keyCode]) {
						C_GUI.eve.Propagation = true;
						C_GUI.eve.keyCode = e.keyCode;
						ev.keyup(C_GUI.eve);
					}
					e.preventDefault();
				}
			});
			aEL(window, "keypress",
			function(e) {
				if (C_GUI.canvasonfocus) {
					C_GUI.eve.Propagation = true;
					C_GUI.eve.keyCode = e.keyCode;
					ev.keypress(C_GUI.eve);
					e.preventDefault();
				}
			});
			C_GUI.context = canvas_dom.getContext("2d");
			C_GUI.currentcontext = C_GUI.buffercontext || C_GUI.context;
			C_GUI.document = C_GUI.Graph.New();
			C_GUI.Graph.Eventable(C_GUI.document);
			C_GUI.document.width = canvas_dom.width;
			C_GUI.document.height = canvas_dom.height;
			C_GUI.drawlist = [C_GUI.document];
		},
		setBuffCanvas: function(buf) {
			C_GUI.buffercanvas = buf;
			C_GUI.buffercontext = C_GUI.buffercanvas.getContext("2d");
			C_GUI.currentcontext = C_GUI.buffercontext || C_GUI.context;
		},
		Graph: {
			New: function(newname) {
				var g = new Object();
				g = {
					name: newname,
					top: 0,
					left: 0,
					width: 1,
					height: 1,
					rotate: 0,
					rotatecenter: {
						x: 0,
						y: 0
					},
					zoom: {
						x: 1,
						y: 1
					},
					display: true,
					opacity: null,
					beforedrawfun: null,
					afterdrawfun: null,
					drawtype: "function",
					//function、image
					drawfunction: null,
					backgroundColor: null,
					eventable: false,
					imageobj: null,
					z_index: null,
					drawlist: null,
					childNode: new Array(),
					parentNode: null,
					drawpic: function(width, height, _draw) {
						this.width = width,
						this.height = height;
						this.imageobj = C_GUI.imagecreater.drawpic(width, height, _draw);
					},
					setZoom: function(x, y) {
						if (arguments.length == 1) this.zoom.x = this.zoom.y = x;
						else if (arguments.length == 2) {
							this.zoom.x = x;
							this.zoom.y = y;
						}
					},
					useImage: function(image) {
						if (!this.imageobj) {
							this.imageobj = document.createElement("canvas");
						}
						try {
							this.width = this.imageobj.width = image.width;
							this.height = this.imageobj.height = image.height;
							this.imageobj.getContext("2d").drawImage(image, 0, 0);
						} catch(e) {
							image.onload = function() {
								this.width = this.imageobj.width = image.width;
								this.height = this.imageobj.height = image.height;
								this.imageobj.getContext("2d").drawImage(image, 0, 0);
							}
						}

					},
					zindex: function(index) {
						this.z_index = index;
						if (this.parentNode) {
							C_GUI.tools.arraybyZ_index(this.parentNode);
						}
					},
					setRotateCenter: function() {
						if (arguments.length == 2) {
							this.rotatecenter.x = arguments[0];
							this.rotatecenter.y = arguments[1];
						} else if (arguments.length == 1) {
							switch (arguments[0]) {
							case "center":
								{
									this.rotatecenter.x = this.width / 2;
									this.rotatecenter.y = this.height / 2;
									break;
								}
							}
						}

					},
					setSize: function(w, h) {
						this.width.w,
						this.height = h;

					},
					New: function() {
						var newobj=Object.create(this);
						newobj.parentNode=null;
						newobj.childNode=new Array;
						newobj.drawlist=null;
						
						return newobj;
					},
					addChild: function(graph) {
						if (graph) {
							this.childNode.unshift(graph);
							graph.parentNode = this;
							C_GUI.tools.arraybyZ_index(this);
						}
					},
					removeChild: function(graph) {
						for (var i = 0; graph != this.childNode[i]; i++) {
							if (i == this.childNode.length) break;
						}
						if (graph == this.childNode[i]) {
							this.childNode.splice(i, 1);
							C_GUI.tools.arraybyZ_index(this);
							graph.parentNode = null;
						}
					}
				};
				return g;
			},
			NewTextObj: function(text, fontsize, fontFamily) {
				var t = C_GUI.Graph.New();
				t.drawtype = "text";
				t.text = text || " ";
				t.baseline = "middle";
				t.fontStyle = null;
				t.fontWeight = null ;
				t.textInput=null;
				t.fontVariant = null;
				t.lineHeight = null;
				t.fontSize = fontsize || "15px";
				t.fontFamily = fontFamily || "Arial";
				t.innerX = 0;
				t.innerY = 0;
				t.color = "#000";
				t.autoSize = true;
				t.editable = false;
				t.textborderWidth = 0;
				t.textborderColor = "#fff";
				t.fill = true;
				t.shadowBlur = 0;
				t.shadowColor = "#CCC";
				t.shadowOffset = {
					x: 0,
					y: 0
				},
				t.maxWidth = 0;
				t.prepareText = function() {
					if (!t.imageobj) {
						t.imageobj = document.createElement("canvas");
					}
					var ct = t.imageobj.getContext("2d");
					//ct.clearRect(0, 0, t.imageobj.width, t.imageobj.height);
					var font = "";
					if (t.fontSize && t.fontFamily) {
						if (t.fontStyle) font += t.fontStyle;
						if (t.fontVariant) font += (" " + t.fontVariant);
						if (t.fontWeight) font += (" " + t.fontWeight);
						font += (" " + t.fontSize);
						if (t.lineHeight) font += (" " + t.lineHeight);
						font += (" " + t.fontFamily);
					} else {
						font = "15px Arial";
					}
					ct.font = font;
					t.font = font;
					if (t.autoSize) {
						var w = ct.measureText(t.text).width;
						t.width = t.imageobj.width = t.maxWidth >= w ? t.maxWidth: w;
						var fontsize = C_GUI.tools.getnum(t.font) * 1.2;
						if (fontsize == 0) {
							fontsize = 20;
						}
						t.height = t.imageobj.height = fontsize;
					} else {
						t.imageobj.width = t.width || 100;
						t.imageobj.height = t.height || 30;
					}
					ct.translate(0, t.imageobj.height / 2);
					ct.textBaseline = t.baseline;
					ct.lineWidth = t.textborderWidth;
					ct.strokeStyle = t.textborderColor;
					ct.fillStyle = t.color || "#000";
					ct.save();
					if (t.shadowBlur > 0) {
						ct.font = font;
						ct.shadowBlur = t.shadowBlur;
						ct.shadowColor = t.shadowColor;
						ct.shadowOffsetX = t.shadowOffset.x;
						ct.shadowOffsetY = t.shadowOffset.y;
					}
					ct.font = font;
					if (t.fill) {
						ct.fillText(t.text, t.innerX, t.innerY);
					}
					if (t.textborderWidth) {
						ct.strokeText(t.text, t.innerX, t.innerY);
					}

					ct.restore();
				};
				t.setSize = function(width, height) {
					t.autoSize = false;
					t.width = width;
					t.height = height;
				}
				t.setText = function(text) {
					t.text = text || " ";
					t.prepareText();
				};
				t.prepareText();
				return t;
			},
			Eventable: function(graph) {
				var g = graph;
				g.eventable = true,
				g.overPath = null,
				g.mouseover = function(e) {
					for (var i = g.events["onmouseover"].length; i != 0; i--) {
						g.events["onmouseover"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mouseover(e)
						}
					}
				};
				g.mouseout = function(e) {
					for (var i = g.events["onmouseout"].length; i != 0; i--) {
						g.events["onmouseout"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mouseout(e)
						}
					}
				}
				g.mousemove = function(e) {
					for (var i = g.events["onmousemove"].length; i != 0; i--) {
						g.events["onmousemove"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mousemove(e)
						}
					};
				}
				g.mousewheel = function(e) {
					for (var i = g.events["onmousewheel"].length; i != 0; i--) {
						g.events["onmousewheel"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mousewheel(e)
						}
					};
				}
				g.mouseup = function(e) {
					for (var i = g.events["onmouseup"].length; i != 0; i--) {
						g.events["onmouseup"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mouseup(e)
						}
					};
				}
				g.click = function(e) {
					for (var i = g.events["onclick"].length; i != 0; i--) {
						g.events["onclick"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.click(e)
						}
					};
				}
				g.centerclick = function(e) {
					for (var i = g.events["oncenterclick"].length; i != 0; i--) {
						g.events["oncenterclick"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.centerclick(e)
						}
					};
				}
				g.rightclick = function(e) {
					for (var i = g.events["onrightclick"].length; i != 0; i--) {
						g.events["onrightclick"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.rightclick(e)
						}
					};
				}
				g.mousedown = function(e) {
					C_GUI.focus = e.target;
					for (var i = g.events["onmousedown"].length; i != 0; i--) {
						g.events["onmousedown"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.mousedown(e)
						}
					};
				}
				g.keydown = function(e) {
					for (var i = g.events["onkeydown"].length; i != 0; i--) {
						g.events["onkeydown"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.keydown(e)
						}
					}
				};
				g.keyup = function(e) {
					for (var i = g.events["onkeyup"].length; i != 0; i--) {
						g.events["onkeyup"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.keyup(e)
						}
					}
				};
				g.keypress = function(e) {
					for (var i = g.events["onkeypress"].length; i != 0; i--) {
						g.events["onkeypress"][i - 1](e);
					}
					if (e.Propagation) {
						if (g.parentNode) {
							g.parentNode.keypress(e)
						}
					}
				};
				g.events = new Array;
				g.events["onmouseover"] = new Array;
				g.events["onmouseout"] = new Array;
				g.events["onmouseup"] = new Array;
				g.events["onmousewheel"] = new Array;
				g.events["onmousemove"] = new Array;
				g.events["onclick"] = new Array;
				g.events["oncenterclick"] = new Array;
				g.events["onrightclick"] = new Array;
				g.events["onmousedown"] = new Array;
				g.events["onkeydown"] = new Array;
				g.events["onkeyup"] = new Array;
				g.events["onkeypress"] = new Array;
				g.addEvent = function(name, fun) {
					if (!g.events[name]) g.events[name] = new Array;
					if (typeof(fun) == "function" && g.events[name]) g.events[name].unshift(fun);
					else {
						return fasle;
					}
				};
				delete g;
			},
			Delete: function(graph) {
				if (graph) {
					if (graph.parentNode) {
						graph.parentNode.removeChild(graph);
					}
					graph = null;
					delete graph;
					return true;
				}
				return false;
			}
		},

		drawElement: function(d, ct) {
			for (var i = 0; i < d.length; i++) {
				if (d[i].display) {

					ct.save();
					ct.translate(d[i].left + d[i].rotatecenter.x, d[i].top + d[i].rotatecenter.y);
					ct.beginPath();
					ct.rotate(d[i].rotate * 0.017453292519943295);
					ct.scale(d[i].zoom.x, d[i].zoom.y);
					if (d[i].opacity != null) ct.globalAlpha = d[i].opacity;
					ct.save();
					ct.save();
					if (d[i].beforedrawfun) d[i].beforedrawfun(ct);
					ct.restore();

					switch (d[i].drawtype) {
					case "function":
						{

							ct.translate( - d[i].rotatecenter.x, -d[i].rotatecenter.y);
							if (d[i].drawfunction) d[i].drawfunction(ct);
							ct.save();
							if (d[i].backgroundColor) {
								ct.fillStyle = d[i].backgroundColor;
								ct.fillRect( - (d[i].rotatecenter.x), -(d[i].rotatecenter.y), d[i].width, d[i].height);
							}
							if (d[i].eventable) {
								if (C_GUI.Debug.stat) {
									ct.save();
									ct.fillStyle = "rgba(29, 145, 194,0.7)";
									ct.strokeStyle = "rgb(255,255,255)";
									ct.lineWidth = 2;
								}
								if (C_GUI.mouseX && C_GUI.mouseY) {
									if (d[i].overPath) {
										ct.beginPath();
										d[i].overPath(ct, d[i]);
									}
									if (ct.isPointInPath(C_GUI.mouseX, C_GUI.mouseY)) {
										C_GUI.newonoverElement = d[i];
									}
								}
								if (C_GUI.Debug.stat) {
									ct.closePath();
									ct.fill();
									ct.stroke();
									ct.restore();
								}

							}

							break;
						}
					case "image":
					case "text":
						{
							ct.save();
							if (d[i].backgroundColor) {
								ct.fillStyle = d[i].backgroundColor;
								ct.fillRect( - (d[i].rotatecenter.x), -(d[i].rotatecenter.y), d[i].width, d[i].height);
							}
							if (d[i].imageobj && d[i].imageobj.width && d[i].imageobj.height) {
								ct.drawImage(d[i].imageobj, -(d[i].rotatecenter.x), -(d[i].rotatecenter.y));
							}
							ct.translate( - d[i].rotatecenter.x, -d[i].rotatecenter.y);
							if (d[i].eventable) {
								if (C_GUI.Debug.stat) {
									ct.save();
									ct.fillStyle = "rgba(0,0,0,0.3)";
									ct.strokeStyle = "rgb(255,255,255)";
									ct.lineWidth = 2;
								}
								if (C_GUI.mouseX && C_GUI.mouseY) {
									ct.beginPath();
									if (d[i].overPath) {
										d[i].overPath(ct, d[i]);
									} else {
										C_GUI.tools.defaultPathFun(ct, d[i]);
									}
									if (ct.isPointInPath(C_GUI.mouseX, C_GUI.mouseY)) {
										C_GUI.newonoverElement = d[i];
									}
								}
								if (C_GUI.Debug.stat) {
									ct.fill();
									ct.stroke();
									ct.restore();
								}

							}
							break;
						}
					}
					if (C_GUI.Debug.stat) {
						ct.save();
						ct.beginPath();
						ct.strokeRect(0, 0, d[i].width, d[i].height);
						ct.stroke();
						var zx = d[i].zoom.x,
						zy = d[i].zoom.y;
						if (d[i].parentNode) {
							zx *= d[i].parentNode.zoom.x,
							zy *= d[i].parentNode.zoom.y;
						}
						ct.scale(1 / zx, 1 / zy);
						ct.textBaseline = "top";
						ct.fillStyle = "rgba(0,0,0,1)";
						ct.font = "20px 宋体";
						switch (d[i].drawtype) {
						case "function":
							{
								ct.fillText("Function", 0, 0);
								break;
							}

						case "image":
							{
								ct.fillText("Image", 0, 0);
								break;
							}
						case "text":
							{
								ct.fillText("Text", 0, 0);
								ct.font = "12px 宋体";
								ct.fillText("font:" + d[i].font, 0, -12);
								break;
							}
						}

						if (C_GUI.Debug.eleinfo) {
							ct.font = "10px 宋体";
							ct.fillText("X:" + d[i].left + " " + "Y:" + d[i].top, 0, 21);
							ct.fillText("rotate:" + d[i].rotate, 0, 31);
							ct.fillText("zoom:" + d[i].zoom.x + "," + d[i].zoom.y, 0, 41);
							ct.fillText("操作点:" + d[i].rotatecenter.x + " " + d[i].rotatecenter.y, 0, 51);
						}
						ct.restore();
					}
					ct.restore();
					if (d[i].afterdrawfun) d[i].afterdrawfun(ct);
					ct.restore();
					ct.translate( - d[i].rotatecenter.x, -d[i].rotatecenter.y);
					if (d[i].childNode.length) {
						C_GUI.drawElement(d[i].drawlist, ct);
					}
					ct.restore();
				}
			}

		},
		mousePosition: {
			fun: null,
			offsetx: 0,
			offsety: 0,
			chrome: function(e) {
				C_GUI.mouseX = e.offsetX - this.offsetx;
				C_GUI.mouseY = e.offsetY - this.offsety;
			},
			ie: function(e) {
				C_GUI.mouseX = e.offsetX + this.offsetx;
				C_GUI.mouseY = e.offsetY + this.offsety;
			},
			firefox: function(e) {
				C_GUI.mouseX = e.pageX - this.offsetx;
				C_GUI.mouseY = e.pageY - this.offsety;
			}
		},

		/*把队列中的图形按index绘制出来*/
		draw: function() {
			C_GUI.newonoverElement = null;
			C_GUI.drawElement(C_GUI.drawlist, C_GUI.currentcontext);
			if (C_GUI.newonoverElement != C_GUI.onoverElement) {
				if (C_GUI.onoverElement && C_GUI.onoverElement.mouseout) {
					C_GUI.eve.target = C_GUI.onoverElement;
					C_GUI.eve.Propagation = true;
					C_GUI.onoverElement.mouseout(C_GUI.eve);
				}
				C_GUI.onoverElement = C_GUI.newonoverElement;
				if (C_GUI.onoverElement && C_GUI.onoverElement.mouseover) {
					C_GUI.eve.target = C_GUI.onoverElement;
					C_GUI.eve.Propagation = true;
					C_GUI.onoverElement.mouseover(C_GUI.eve);
				}
			}
		},

		e: {
			mouseoutcanvas: function() {
				C_GUI.mouseX = null;
				C_GUI.mouseY = null;
				if (C_GUI.onoverElement && C_GUI.onoverElement.mouseout) {
					C_GUI.eve.target = C_GUI.onoverElement;
					C_GUI.onoverElement.mouseout(C_GUI.eve);
				}
				C_GUI.onoverElement = null;
				C_GUI.canvasonfocus = false;
			},
			mouseover: function(e) {
				if (C_GUI.tosign.click) {
					C_GUI.tosign.click = false;
				}
				if (C_GUI.tosign.centerclick) {
					C_GUI.tosign.centerclick = false;
				}
				if (C_GUI.tosign.rightclick) {
					C_GUI.tosign.rightclick = false;
				}
				if (C_GUI.onoverElement && C_GUI.onoverElement.mouseover) {
					C_GUI.onoverElement.mouseover(e);
				}
			},
			mousewheel: function(e) {
				if (C_GUI.onoverElement && C_GUI.onoverElement.mousewheel) {
					C_GUI.onoverElement.mousewheel(e);
				}
			},
			mousedown: function(e) {
				C_GUI.tosign.click = true;
				switch (e.button) {
				case 0:
					C_GUI.tosign.click = C_GUI.mouseleft = true;
					break;
				case 1:
					C_GUI.tosign.centerclick = C_GUI.mousecenter = true;
					break;
				case 2:
					C_GUI.tosign.rightclick = C_GUI.mouseright = true;
					break;
				}
				if (C_GUI.onoverElement && C_GUI.onoverElement.mousedown) {
					if (C_GUI.onoverElement.mousedown) {
						C_GUI.onoverElement.mousedown(e);
					}
					C_GUI.focus = C_GUI.onoverElement;
				}
			},
			mousemove: function(e) {
				if (C_GUI.onoverElement && C_GUI.onoverElement.mousemove) {
					C_GUI.onoverElement.mousemove(e);
				}
			},
			mouseup: function(e) {
				switch (e.button) {
				case 0:
					C_GUI.mouseleft = false;
					if (C_GUI.tosign.click && e.target && e.target.click) {
						e.target.click(e);
					}
					break;
				case 1:
					C_GUI.mousecenter = false;
					if (C_GUI.tosign.centerclick && e.target && e.target.centerclick) {
						e.target.centerclick(e);
					}
					break;
				case 2:
					C_GUI.mouseright = false;
					if (C_GUI.tosign.rightclick && e.target && e.target.rightclick) {
						e.target.rightclick(e);
					}
					break;
				}
				if (C_GUI.onoverElement && C_GUI.onoverElement.mouseup) {
					C_GUI.onoverElement.mouseup(e);
				}
			},
			keydown: function(e) {
				C_GUI.keys[e.keyCode] = true;
				if (C_GUI.focus && C_GUI.focus.keydown) {
					C_GUI.focus.keydown(e);
				}
			},
			keyup: function(e) {
				C_GUI.keys[e.keyCode] = false;
				if (C_GUI.focus && C_GUI.focus.keyup) {
					C_GUI.focus.keyup(e);
				}
			},
			keypress: function(e) {
				C_GUI.keys[e.keyCode] = false;
				if (C_GUI.focus && C_GUI.focus.keypress) {
					C_GUI.focus.keypress(e);
				}
			},
		},
		tools: {
			getnum: function(string) {
				if (!string) return 0;
				else {
					var a = Number(string.match(/\d+/)[0]);
					if (a) return a;
					else return 0;
				}
			},
			paixurule: function(a, b) {
				return a.z_index - b.z_index;
			},
			arraybyZ_index: function(graph) {
				if (graph.childNode) graph.drawlist = graph.childNode.sort(C_GUI.tools.paixurule);
			},
			defaultPathFun: function(ct, graph) {
				ct.rect(0, 0, graph.width, graph.height);
			},
			addEventListener: function(dom, e, fun) {
				if (dom.addEventListener) dom.addEventListener(e, fun, false);
				else if (dom.attachEvent) dom.attachEvent("on" + e, fun);
				else {
					dom["on" + e] = fun;
				}
			},
			数值渐变: function(开始, 结束, 作用对象, 时间) {
				
			},
			getBrowser: function() {
				var b = navigator.userAgent.toLowerCase().match(/MSIE|Firefox|Opera|Safari|Chrome/i)[0];
				return b;
			},
			rand: function(min, max) {
				return Math.floor(min + Math.random() * (max - min));
			}

		},
		tosign: {
			click: false,
			centerclick: false,
			rightcilck: false,
			onmoveele: null,
			drag: false
		},

		Debug: {
			stat: false,
			eleinfo: false,
			on: function() {
				C_GUI.Debug.stat = true;
			},
			off: function() {
				C_GUI.Debug.stat = false;
			}
		},

		/*在当前基础上新建一个对象*/
		New: function() {
			return Object.create(this);
		}
	}
	return C_GUI;
}