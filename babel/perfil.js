'use strict';

$('#btnPerfil').click(function (e) {
  e.preventDefault();
  mostrarPerfil();
});

function guardarPerfil() {
  var $nombre = $('#nombreEditar'),
      $email = $('#emailEditar'),
      $username = $('#usernameEditar');

  if ($nombre.val().length > 0 && $email.val().lenght > 0 && $username.lenght > 0) {
    var uid = firebase.auth().currentUser.uid;
    var usuarioRef = firebase.database().ref('usuarios/planta/almacen/' + uid);
    usuarioRef.update({
      nombre: $nombre.val(),
      email: $email.val(),
      username: $username.val()
    });
  } else {
    if ($nombre.val().length > 0) {
      $nombre.parent().removeClass('has-error');
      $('#helpBlockNombreEditar').addClass('hidden');
    } else {
      $nombre.parent().addClass('has-error');
      $('#helpBlockNombreEditar').removeClass('hidden');
    }
    if ($email.val().length > 0) {
      $email.parent().removeClass('has-error');
      $('#helpBlockEmailEditar').addClass('hidden');
    } else {
      $email.parent().addClass('has-error');
      $('#helpBlockEmailEditar').removeClass('hidden');
    }
    if ($username.val().length > 0) {
      $username.parent().removeClass('has-error');
      $('#helpBlockUsernameEditar').addClass('hidden');
    } else {
      $username.parent().addClass('has-error');
      $('#helpBlockUsernameEditar').removeClass('hidden');
    }
  }
}

function cambiarContraseña() {
  var $contraseña = $('#contraseñaEditar');
  var newPassword = $contraseña.val();

  if (newPassword.length > 0) {
    firebase.auth().currentUser.updatePassword(newPassword).then(function () {
      $('#btnCambiarContraseña').addAttr('disabled');
      $contraseña.addAttr('readonly');

      $contraseña.parent().parent().removeClass('has-error');
      $('#helpBlockContraseñaEditar').addClass('hidden');
    }, function (error) {});
  } else {
    $contraseña.parent().parent().addClass('has-error');
    $('#helpBlockContraseñaEditar').text('Campo obligatorio').removeClass('hidden');
  }
}

function permitirCambioContraseña() {
  $('#contraseñaEditar').removeAttr('readonly').focus();
  $('#btnCambiarContraseña').removeAttr('disabled');
}

function mostrarPerfil() {
  var uid = firebase.auth().currentUser.uid;
  var usuarioRef = firebase.database().ref('usuarios/planta/almacen/' + uid);
  usuarioRef.once('value', function (snap) {
    var datos = snap.val();

    var $nombre = $('#nombreEditar'),
        $puesto = $('#puestoEditar');
    $descripcion = $('#descripcionEditar'), $region = $('#regionEditar'), $email = $('#emailEditar'), $username = $('#usernameEditar');

    $nombre.val(datos.nombre);
    $puesto.val(datos.puesto);
    $descripcion.val(datos.descripcion);
    $region.val(datos.region);
    $email.val(datos.email);
    $username.val(datos.username);

    $('#modalPerfil').modal('show');
  });
}