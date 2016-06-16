// JavaScript Document

(function($){
	// Cria um form dinamicamete
	$.fn.doform = function(settings){

		var config = {
			action : '',
			method : 'post',
			data : '',
			classerror : 'df-error',
			classinput : 'df-input',
			classgroup : 'df-group',
			mode : 'new',
			textButton : { 	'new' 	: {	'submit' : 'Send',
										'cancel' : 'Cancel'	
										},
							'edit' 	: { 'submit' : 'Alter',
										'cancel' : 'Cancel'	
										},
							'view'	: { 'submit' : 'Edit',
										'cancel' : 'Close'	
										}
									 },
			submit: function(options) {

			},
       		validate: function(form) {

       			var ok = true;

       			form.find('input[required=yes],select[required=yes]').each(function(){

       				var datatype = $(this).attr('data-type');
       				if( !validateInput(datatype, $(this)) ){
       					ok = false;
       				}       				

       			});

       			return ok;
       		},
       		confirmation : '',
       		ajax : true,
       		footer : true,
       		loaded : function(form){ },
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
       							}
       						},
       		type_mask : {
       			cpf : '000.000.000-00',
       			date : '00/00/0000',
       			port : '0000'
       		}
		};
		

		// variaveis do objeto
		var input_error = ''; // carrega o valor do input que estiver com erro
		var message = '' // Mensagem de erro ou sucesso 
		var blocking = false;
		
		// Mostra erro e destaca o campo 
		var showerror = function( input ){

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
		var block = function(){

			if( !blocking ){

				unblock();

				form.block ({ 	message: 'Processing...',
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
			block();
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
							showmessage( ret.message );
						}
						
					}	
				},
				complete : function(){
					unblock();
				}
			});
			
		}

		// função valida input individualmente
		var validateInput = function( type, input ){


			if( config.type_validate[type] ){
				var func = config.type_validate[type];
				var ok = func( input );
			}else{
				//se for required
				if( input.attr('required') == 'required'){
					var ok = (input.val());
				}
			}

			if(!ok){
				input.addClass( config.classerror ).val('');
			}

			// no focus tira a classe de erro
			input.unbind('focus');
			input.focus(function(){
				$(this).removeClass( config.classerror );
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

			form.find('')

		}

		// Escreve inputs
		var writeinput = function( form ){
			if( config.data ){

				//limpa form
				form.html('');

				//bloqueia form
				block();
				$.ajax({
					url : config.data + '?' + Math.random() ,
					dataType : 'JSON',
					success : function( ret ){
						
						// tratamento de retorno
						if( ret ){

							// varre dados
							for( var i in ret ){
								// adiciona group
								form.append( "<div class='"+config.classgroup+"' ></div>" );
								var group = form.find("."+config.classgroup+":last-child");
								group.append("<div class='groupname'>"+ ret[i].groupname +"</div>");
								// adiciona campos
								for( var f in ret[i].data ){
									// Seletor input, select e textarea
									var selector = 'input';
									// fechamento tag
									var close = '>';
									var size = ret[i].data[f].size;
									var type = " type='text' ";
									var required = '';
									var opts = '';
									var extra_class = '';

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
									}

									if( ret[i].data[f].required == 'yes' ){
										required = "required='required'";
									}

									//hmtl input
									var html_input = '';
										html_input += "<div class='"+config.classinput+" "+ret[i].data[f].name+" "+extra_class+" '>";
										html_input += "<label for='"+ret[i].data[f].name+"'>"+ret[i].data[f].label+"</label>";	
										html_input += "<"+selector+" name='"+ ret[i].data[f].name +"' id='"+ ret[i].data[f].name +"' "+type+" value='"+ ret[i].data[f].value +"' "+ required +" placeholder='"+ ret[i].data[f].label +"' data-type='"+ ret[i].data[f].type +"' size='"+ret[i].data[f].size+"' "+close+" ";
										html_input += "</div>";

									// append input
									group.append( html_input+'<div class="clear"> </div>' );
									// onblur no ultimo input inserido
									group.find(selector+':last-child').unbind('blur');
									group.find(selector+':last-child').blur(function(){
										// Valida input onblur
										validateInput( $(this).attr('data-type'), $(this) );
									});
								}
							}

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

							form.prepend("<input type='hidden' name='dfmode' value='"+config.mode+"' />");

							if( config.footer ){
								// Adicionar Submit
	           					form.append("<div class='df-group df-footer'><div class='"+config.classinput+"' ><input type='submit' value='Enviar' id='df-submit' /></div><div class='clear'> </div><div class='"+config.classinput+"' ><input type='button' id='df-reset' class='reset' value='Cancelar' /></div><div class='clear'> </div></div>");
	           					form.find('#df-reset').unbind('click').click(function(){
	           						doReset();
	           					})
							}							


	           				var t = 100;
							var time = 0;
							form.find( "."+config.classinput ).each(function(){
								$(this).delay(time).fadeIn( 1000 );	
								time += t;
							})

							config.loaded();

						}	

					},
					complete : function(){
						// debloqueia form
						unblock();
					}
				});

			}else{
				alert('Não contem .json para fazer o formulario');
			}
		}


		// pegas as propriedades da função e transfere para o objeto
		if (settings){$.extend(config, settings);}
		
		var form ;

		this.filter( "form" ).each(function() {
            
			form = $( this );
			writeinput( form );
            
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
 					
 					if( config.confirmation ){
 						block();
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
 			   		
		           	return false;				

 				}

 				return false;

           	})

        });
 
        return this;
		
	}
})(jQuery);