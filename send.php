<?php

	// PHP send here
	
	$success = true;
	$message = 'Sucesso ao gravar registro!';

	if($success){
		$success = ( $_POST['email'] != 'ulisses.bueno@gmail.com' );
		if( !$success ) $message = 'Já existem um usuário com esse e-mail!';
	}

	if($success){
		$success = ( strlen($_POST['password']) >= 6 );
		if( !$success ) $message = 'Senha deve conter pelos menos 6 caracteres!';
	}
	
	if($success){
		$success = ( $_POST['password'] == $_POST['repeat-password'] );
		if( !$success ) $message = 'Senhas estão diferentes!';
	}

	echo '{"success":"'.$success.'","message":"'.  $message .'"}';	
	

?>