'use strict';

var db = firebase.database();
var auth = firebase.auth();

var LANGUAGE = {
  searchPlaceholder: "Buscar",
  sProcessing: 'Procesando...',
  sLengthMenu: 'Mostrar _MENU_ registros',
  sZeroRecords: 'No se encontraron resultados',
  sEmptyTable: 'Ningún dato disponible en esta tabla',
  sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
  sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
  sInfoPostFix: '',
  sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
  sUrl: '',
  sInfoThousands: ',',
  sLoadingRecords: 'Cargando...',
  oPaginate: {
    sFirst: 'Primero',
    sLast: 'Último',
    sNext: 'Siguiente',
    sPrevious: 'Anterior'
  },
  oAria: {
    sSortAscending: ': Activar para ordenar la columna de manera ascendente',
    sSortDescending: ': Activar para ordenar la columna de manera descendente'
  }
};

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    // startDate: "today",
    language: "es"
  });

  mostrarDatosOferta();
});

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function mostrarDatosOferta() {
  var idOferta = getQueryVariable('id');
  db.ref('ofertas/' + idOferta).on('value', function (snapshot) {
    var oferta = snapshot.val();

    $('#clave').html(oferta.clave);
    $('#consorcio').html(oferta.consorcio);
    $('#tiendas').html(oferta.tiendas.join(', '));
    var productos = oferta.productos;

    var datatable = $('#productos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
    var filas = '';
    datatable.clear();

    productos.forEach(function (producto, i) {
      filas += '<tr>\n                  <td>' + producto.clave + '</td>\n                  <td>' + producto.nombre + '</td>\n                  <td>$ ' + producto.precioLista + '</td>\n                  <td>$ ' + producto.precioOferta + '</td>\n                  <td class="text-center"><button type="button" onclick="abrirModalEditarProducto(\'' + i + '\')"  class="btn btn-xs btn-warning"><span class="fas fa-pencil-alt"></span></button></td>\n                  <td class="text-center"><button type="button" onclick="eliminarProducto(\'' + producto + '\')" class="btn btn-xs btn-danger"><span class="fas fa-trash"></span></button></td>\n                </tr>';
    });
    datatable.rows.add($(filas)).columns.adjust().draw();

    //$('#productos tbody').html(filas);
  });
}

function abrirModalEditarProducto(idProducto) {
  var idOferta = getQueryVariable('id');
  db.ref('ofertas/' + idOferta + '/productos/' + idProducto).once('value', function (snapshot) {
    var producto = snapshot.val();
    $('#claveProducto').val(producto.clave);
    $('#nombreProducto').val(producto.nombre);
    $('#precioLista').val(producto.precioLista);
    $('#precioOferta').val(producto.precioOferta);

    $('#btnEditar').attr('onclick', 'actualizarProducto(\'' + idProducto + '\')');
    $('#modalEditarProducto').modal('show');
  });
}

function actualizarProducto(idProducto) {
  var idOferta = getQueryVariable('id');
  var precioOferta = $('#precioOferta').val();

  db.ref('ofertas/' + idOferta + '/productos/' + idProducto).update({
    precioOferta: precioOferta
  });
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'El producto fue actualizado con exito' });
  $('#modalEditarProducto').modal('hide');
}

function eliminarProducto(producto) {
  swal({
    title: "¿Está seguro de eliminar este producto?",
    text: "",
    icon: "warning",
    buttons: true,
    confirm: true
  }).then(function (will) {
    if (will) {
      db.ref('ofertas/' + idOferta + '/productos').child(producto).remove();

      swal("El producto se ha eliminado", {
        icon: "success"
      });
    }
  });
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>\n                <a>\n                  <div>\n                    <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                    <span class="pull-right text-muted small">' + fecha + '</span>\n                  </div>\n                </a>\n              </li>';
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}