// JavaScript Document

(function($){
	// Cria um form dinamicamete
	$.fn.doform = function(settings){
		var form = $(this);
		var config = {
			action : '',
			method : 'post',
			data : '',
			classerror : 'df-error',
			classinput : 'df-input',
			classgroup : 'df-group',
			mode : 'new',
			textButtonSubmit : 	'Send',
			buttons : {},
			buttonCancel : function( form ){

			},
			submit: '',
       		validate: function(form) {

       			var ok = true;

       			form.find('input[required=required],select[required=required],textarea[required=required]').each(function(){

       				if( ok ){

       					var datatype = $(this).data('type');
	       				if( !validateInput(datatype, $(this), true) ){
	       					ok = false;
	       				}  
       				}
       				     				

       			});

       			return ok;
       		},
       		confirmation : '',
       		ajax : true,
       		footer : true,
       		loaded : function(form){ },
       		after_submit: '', 
       		before_submit: '', 
       		type_validate : { 
       							email : function( input ){
       								var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  									return regex.test(input.val());
       							} ,
       							cpf : function( input ){

       								value = input.val();
								    value = value.replace('.','');
								    value = value.replace('.','');
								    cpf = value.replace('-','');
								    while(cpf.length < 11) cpf = "0"+ cpf;
								    var expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;
								    var a = [];
								    var b = new Number;
								    var c = 11;
								    for (i=0; i<11; i++){
								        a[i] = cpf.charAt(i);
								        if (i < 9) b += (a[i] * --c);
								    }
								    if ((x = b % 11) < 2) { a[9] = 0 } else { a[9] = 11-x }
								    b = 0;
								    c = 11;
								    for (y=0; y<10; y++) b += (a[y] * c--);
								    if ((x = b % 11) < 2) { a[10] = 0; } else { a[10] = 11-x; }

								    var retorno = true;
								    if ((cpf.charAt(9) != a[9]) || (cpf.charAt(10) != a[10]) || cpf.match(expReg)) retorno = false;

								    return retorno;
       							},
       							ftp : function( input ){

       								value = input.val().trim();
       								if( value && value.indexOf('ftp://') == -1 ){
       									value = 'ftp://'+value;
       								}
       								input.val(value);

       								return true;
       							},
       							date: function( input ){

       								var data = input.val();
								    var dia = data.substring(0,2)
								    var mes = data.substring(3,5)
								    var ano = data.substring(6,10)
								 
								    //Criando um objeto Date usando os valores ano, mes e dia.
								    var novaData = new Date(ano,(mes-1),dia);
								 
								    var mesmoDia = parseInt(dia,10) == parseInt(novaData.getDate());
								    var mesmoMes = parseInt(mes,10) == parseInt(novaData.getMonth())+1;
								    var mesmoAno = parseInt(ano) == parseInt(novaData.getFullYear());
								 
								    if (!((mesmoDia) && (mesmoMes) && (mesmoAno)))
								    {
								       	return false;
								    }  
								    return true;
       							},
       							money:function( input ){

       								var val = input.val();
       								val = val.replace(/\./g,'');
       								val = val.replace(/\,/,'.');
       								val = Number(val);

       								if( !val ) return false;
       								return true;


       							}
       						},
       		type_mask : {
       			cpf : '000.000.000-00',
       			date : '00/00/0000',
       			datetime : '00/00/0000 00:00',
       			port : '0000'
       		},
       		realtime : false,
       		alert_error : ''
		};
		

		// variaveis do objeto
		var input_error = ''; // carrega o valor do input que estiver com erro
		var message = '' // Mensagem de erro ou sucesso 
		var blocking = false;
		var databackup = {};
		
		var realtime = function(){
			
			var changed = false;
			form.find("input:not(.df-btn):not(.df),select,textarea").each(function(){

				var input = $(this);
				var name = input.attr('name');
				var value = input.val();

				if( databackup[name] != value ){
					changed = true;
				}

			});

			if( changed ) {
				form.find('.df-submit').css('pointer-events','auto').css( {'opacity':1} );
				form.addClass('changed');
			}else{
				form.find('.df-submit').css('pointer-events','none').css( {'opacity':0.5} );
				form.removeClass('changed');
			}

		}

		//add buttons
		var addButtons_old = function(){

			form.find('.df-group.df-footer').html('');
			var buttons = [];
			var buts = config.textButton[ config.mode ];

			for( b in buts ){
				
				form.find('.df-group.df-footer').append("<div class='"+config.classinput+" df-"+b+"' ><input type='button' id='df-"+b+"' class='df-btn df-"+b+"' value='"+ buts[b] +"'  /></div><div class='clear'> </div>" );

			}

			form.find('.df-input').show();
			
			form.find('#df-reset').unbind('click').click(function(){
				config.buttonCancel( form );
				doReset();
				changeMode( 'view' );
			});

			form.find('#df-submit').unbind('click').click(function(){
				form.submit();
			});

			form.find('#df-edit').unbind('click').click(function(){
				changeMode( 'edit' );
			});

			form.find('#df-new').unbind('click').click(function(){
				changeMode( 'new' );
			})
		}

		var addButtons = function(){

			form.find('.df-group.df-footer').html('');
			$.extend( config.buttons, { 'submit' : {    name : config.textButtonSubmit ,
                                                		click : function(){
                                                    		form.submit();
                                                		}
                                            		} 
                                       });
			var buts = config.buttons;
			for( b in buts ){
				
				form.find('.df-group.df-footer').append("<div class='"+config.classinput+" df-"+b+"' ><input type='button' id='df-"+b+"' class='df-btn df-"+b+"' value='"+ buts[b].name +"'  /></div><div class='clear'> </div>" );
				//alert( ".df-group.df-footer ."+config.classinput+".df-"+b+" " )
				form.find(".df-group.df-footer ."+config.classinput+".df-"+b+" ").click(buts[b].click);
				if( buts[b].css ){
					form.find(".df-group.df-footer ."+config.classinput+".df-"+b+" ").css(buts[b].css);	
				} 

			}

			form.find('.df-input').show();
		}

		// Mostra erro e destaca o campo 
		var showerror = function( error_type, type, input, fromForm ){

			input.addClass( config.classerror ).val('');
			
			if( !input.attr('error_status') == error_type ){

				input.attr('error_status',error_type);
				
				var parent = input.parent();
				parent.find('.df-alert-error').remove();
				var message = '';
				parent.css('position','relative');
				switch( error_type ){
					// Campo vazio
					case 1:

						message = "Este campo &eacute; obrigat&oacute;rio";

						break;

					case 2:

						message = "Preencha corretamente este campo";

						break;

				};

				input.after("<div class='df-alert-error' >"+message+"</div>");
				parent.find('.df-alert-error').delay(2000).fadeOut( 2000, function(){
					parent.find('.df-alert-error').remove();
					input.removeAttr('error_status');
				})
			}

			if( fromForm ){
				input.focus();
			}
			
		}

		// Exibe mensagem
		var showmessage = function( message ){

			form.find('#df-dialog').remove();
			form.append("<div id='df-dialog' style='display:none'>"+message+"</div>");

			$( "#df-dialog" ).dialog({
			      modal: true,
			      buttons: {
			        Ok: function() {
			          $( this ).dialog( "close" );
			          $('.ui-dialog').remove();
			        }
			      }
		    });
		}

		// Block Form
		var blockform = function( message ){
			if( !blocking ){
				unblock();

				form.block ({ 	message: '',
								css: { 
						            border: 'none', 
						            padding: '15px', 
						            backgroundColor: '#fff', 
						            '-webkit-border-radius': '10px', 
						            '-moz-border-radius': '10px', 
						            opacity: .5, 
						            color: '#000'
						        }
						    });
				blocking = true;
			}
			
		}

		// Unblobk Form
		var unblock = function(){
			form.unblock();
			blocking = false;
		}

		// Envia os dados do formulario
		var send = function(){	

			if( config.before_submit ){
				if( !config.before_submit() ){
					return false;
				}

			}

			blockform();
			$.ajax({
				url : config.action,
				data : form.serialize() ,
				dataType : 'JSON',
				type: config.method,
				success : function( ret ){
					// tratamento de retorno
					if( ret ){

						// Success!
						if( ret.success ){
							
						}

						if( ret.message ){
							if(config.alert_error){
								config.alert_error( ret.message, ret.success );
							}else{
								showmessage( ret.message );
							}
							
						}

						if( config.after_submit ){
							config.after_submit( ret );
						}
						
						
					}	
				},
				complete : function(){
					unblock();
				}
			});
			
		}

		// função valida input individualmente
		var validateInput = function( type, input, fromForm ){

			var error_type = 1;
			var ok = true;

			//se for required
			if( input.attr('required') == 'required'){
				ok = (input.val());
			}

			if( ok ){
				if( config.type_validate[type] ){
					var func = config.type_validate[type];
					ok = func( input );
					error_type = 2;

				}
			}
			
			if(!ok){
				showerror( error_type , type , input, fromForm );
			}

			// no focus tira a classe de erro
			//input.unbind('focus');
			input.focus(function(){
				$(this).removeClass( config.classerror );
				//$(this).parent().find('.df-alert-error').remove();
			});

			return ok;
			
		}

		// Confirmação
		var doConfirm = function( conf ){

			form.find('#df-dialog').remove();
			form.append("<div id='df-dialog' style='display:none'>"+conf+"</div>");
			
			$("#df-dialog" ).dialog({
		      resizable: true,
		      modal: true,
		      buttons: {
		        "Confirmar": function() {
		        	send();
		          	$( this ).dialog( "close" );
		          	$('.ui-dialog').remove();
		        },
		        "Cancelar": function() {
		        	unblock();
		          	$( this ).dialog( "close" );
		          	$('.ui-dialog').remove();
		        }
		      }
		    });			
		}

		var doReset = function(){

			form.find('');

		}

		var changeMode = function( m ){
			
			config.mode = m;
			form.find('#df-mode').val( config.mode );
			form.attr('mode', config.mode );

			if( m == 'new'){
				form.find( "input[fixed=''],textarea[fixed=''],select[fixed='']" ).each( function(){
					$(this).val('');
				})
			}
			
			addButtons();
		}

		var ReadJson = function( ret, form ){

			//limpa form
			form.html('');
			// varre dados
			for( var i in ret ){

				var groupclass = '';
				if( ret[i].groupclass ) groupclass = ret[i].groupclass;

				// adiciona group
				form.append( "<div class='"+config.classgroup+" "+groupclass+" ' ></div>" );
				var group = form.find("."+config.classgroup+":last-child");
				group.append("<div class='groupname'>"+ ret[i].groupname +"</div>");
				// adiciona campos
				for( var f in ret[i].data ){

					var req = '';
					// Seletor input, select e textarea
					var selector = 'input';
					// fechamento tag
					var close = '>';
					var size = ret[i].data[f].size;
					var type = " type='text' ";
					var required = '';
					var opts = '';
					var extra_class = '';
					var fixed = '';
					if( ret[i].data[f].fixed ) fixed = ret[i].data[f].fixed;
					var input_class = '';
					if( ret[i].data[f].class ) input_class = ret[i].data[f].class;
					var disabled = '';
					if( ret[i].data[f].disabled == 'yes') disabled = 'disabled="disabled"';
					var readonly = '';
					if( ret[i].data[f].readonly == 'yes' ) readonly = 'readonly="readonly"';
					var label = '';
					if( ret[i].data[f].label ) label = ret[i].data[f].label;

					var no_div = false;

					// por tipo 
					switch( ret[i].data[f].type ){
						// select
						case 'select':
							size = '';
							selector = 'select';
							var options = [];

							if( ret[i].data[f].options ){

								for( var p in ret[i].data[f].options ){
									options.push( "<option value='"+ret[i].data[f].options[p].value+"'>"+ret[i].data[f].options[p].text+"</option>" );
								}

								if( options.length ){
									opts = options.join('');
									close = ">"+opts+"</select>";													
								}
							}

							break;

						case 'checkbox':
							extra_class = "multi-checkbox";
							size = '';
							selector = 'div';
							var options = [];
							if( ret[i].data[f].options ){

								for( var p in ret[i].data[f].options ){
									options.push( "<li><input type='checkbox' value='"+ret[i].data[f].options[p].value+"' name='"+ret[i].data[f].options[p].name+"' /><span>"+ret[i].data[f].options[p].label+"</span></li>" );
								}

								if( options.length ){
									opts = options.join('');
									close = "><ul>"+opts+"</ul></div>";
								}
							}

							break;	

						case 'radio':
							extra_class = "multi-radio";
							size = '';
							selector = 'div';
							var options = [];
							if( ret[i].data[f].options ){

								for( var p in ret[i].data[f].options ){
									options.push( "<li><input type='radio' value='"+ret[i].data[f].options[p].value+"' name='"+ret[i].data[f].options[p].name+"' /><span>"+ret[i].data[f].options[p].label+"</span></li>" );
								}

								if( options.length ){
									opts = options.join('');
									close = "><ul>"+opts+"</ul></div>";
								}
							}

							break;	

						// textarea
						case 'textarea':
							size = '';
							selector = 'textarea';
							close = "></textarea>";
							break;
						case 'password':
							type = " type='password' ";
							break;
						case 'hidden':
							type = " type='hidden' ";
							no_div = true;
							break;
						case 'free':
							type = " ";
							selector = "div";
						default:

							//

					}

					class_required = '';
					if( ret[i].data[f].required == 'yes' ){
						required = "required='required'";
						class_required = 'required';
						req = '*';
					}

					if( config.mode == 'new' ){
						if( !ret[i].data[f].fixed ){
							ret[i].data[f].value = '';	
						}										
					}

					databackup[ ret[i].data[f].name ] = ret[i].data[f].value;

					//hmtl input
					var html_input = '';

					if( !no_div  ){
						html_input += "<div class='"+config.classinput+" "+ret[i].data[f].name+" "+extra_class+" "+class_required+" '>";
						if(label) html_input += "<label for='"+ret[i].data[f].name+"' class='"+class_required+"'>"+ret[i].data[f].label+" "+req+"</label>";	
					}
						html_input += "<"+selector+" "+type+" class='"+input_class+"' name='"+ ret[i].data[f].name +"' id='"+ ret[i].data[f].name +"' value='"+ ret[i].data[f].value +"' "+ required +" placeholder='"+ ret[i].data[f].label +"' data-type='"+ ret[i].data[f].type +"' size='"+ret[i].data[f].size+"' fixed='"+fixed+"' "+disabled+" "+readonly+" "+close+" ";
					if( !no_div  ){	
						html_input += "</div>";
					}

					// append input
					group.append( html_input+'<div class="clear"></div>' );
					// onblur no ultimo input inserido
					group.find(selector+':last-child').unbind('blur');
					group.find(selector+':last-child').blur(function(){
						// Valida input onblur
						validateInput( $(this).attr('data-type'), $(this) );
					});

					form.show()

				}
			}			
		}

		// Escreve inputs
		var writeinput = function( form ){
			if( config.data ){

				if( typeof config.data === "object"){
					ReadJson(config.data,form)
					Finaly(form)
				}else{
					
					//bloqueia form
					blockform();
					$.ajax({
						url : config.data + '?' + Math.random() ,
						dataType : 'JSON',
						success : function( ret ){
							
							// tratamento de retorno
							if( ret ){

								ReadJson(ret,form);	
								Finaly(form)						

							}	

						},
						complete : function(){
							// debloqueia form
							unblock();
						}
					});	
				}

			} else {
				Finaly(form)			
			}
			
		}

		var Finaly = function( form ){
			//group.append( "<div style='clear: both'> </div>" );

			// Set mask
			form.find('input,select,textarea').each(function(){

				var input = $(this);
				var type = input.attr('data-type');
				if( config.type_mask[type] ){
					input.unmask();

					if( typeof type == 'string' ){
						input.mask( config.type_mask[type] );	
					}

					if( typeof type == 'object' ){
						//input.mask( config.type_mask[type].mask, config.type_mask[type].options );
					}
					
				}

			});

			form.prepend("<input type='hidden' id='df-mode' name='df-mode' value='"+config.mode+"' fixed='true' class='df' />");

			if( config.footer ){								
				form.append("<div class='df-group df-footer'> </div>");
				addButtons();
			}							
			
			/*var t = 100;
			var time = 0;
			form.find( "."+config.classinput ).each(function(){
				$(this).delay(time).fadeIn( 1000 );	
				time += t;
			})*/

			config.loaded();
		}

		
		// pegas as propriedades da função e transfere para o objeto
		if (typeof settings === 'object'){
			$.extend(config, settings);

			var form ;


			this.filter( "form" ).each(function() {
				form = $( this );
				writeinput( form );
				form.attr('mode',config.mode);

				// se realtime estiver ativo
				if( config.realtime )  setInterval(function(){ realtime() }, 2000);
	            
	           	// se tiver um action
	           	if( config.action ){
	           		form.attr('action',config.action);
	           	}

	           	// se tiver um action
	           	if( config.method ){
	           		form.attr('method',config.method);
	           	}

	           	// Submit
	           	form.unbind('submit');
	           	form.submit(function(){
	           		
	           		// Validar campos
	           		var ok_validate = config.validate(form);

	 				// Se a validação tiver ok
	 				if( ok_validate ){

	 					if( config.submit ){

	 						config.submit();

	 					} else {

	 						if( config.confirmation ){
		 						blockform();
		 						// Valida PHP
			 					$.ajax({
			 						url : config.confirmation,
			 						dataType : 'JSON',
			 						success : function( ret ){
			 							// tratamento de retorno
			 							if( ret ){
			 								// Success!
			 								if( ret.confirm ){
			 									// Se for ajax
			 									doConfirm( ret.confirm );
		 										return;

			 								}else{

			 									unblock();
			 									if( ret.message ){
			 										showmessage( ret.message );
			 									}	 									
		 										
			 								}
			 							}	
			 						}
			 					});	

		 					} else {
		 						// Se for ajax
								if( config.ajax ){
									send();	
								}else{
									return send();	
								}		
		 					}
	 					}
	 			   		
			           	return false;				

	 				}

	 				return false;

	           	})

	        });
	 	
	        return this;
		}

		if (typeof settings === 'string') {
			var fun = eval(settings);
			fun.apply()
		}
		
		
		
	}


})(jQuery);