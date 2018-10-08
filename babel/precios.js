'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
  sSearch: '<i style="color: #4388E5;" class="fas fa-search"></i>',
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

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

  llenarConsorcios();
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

function haySesion() {
  auth.onAuthStateChanged(function (user) {
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

      lis += '<li>\n                  <a>\n                    <div>\n                      <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                      <span class="pull-right text-muted small">' + fecha + '</span>\n                    </div>\n                  </a>\n                </li>';
    }
    $('#contenedorNotificaciones').html(lis);
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

$('#consorcio').change(function () {
  mostrarProductos();
});

function llenarConsorcios() {
  db.ref('consorcios').once('value', function (snapshot) {
    var options = '<option disabled selected>Seleccionar</option>';
    var consorcios = snapshot.val();

    for (var consorcio in consorcios) {
      options += '<option value="' + consorcio + '">' + consorcio + '</option>';
    }

    $('#consorcio').html(options);
  });
}

function mostrarProductos() {
  var datatable = $('#tablaPrecios').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  var consorcio = $('#consorcio').val();

  db.ref('consorcios/' + consorcio + '/productos').on('value', function (productos) {
    var filas = '';
    var arrProductos = [];
    productos.forEach(function (producto) {
      arrProductos.unshift(_extends({
        id: producto.key
      }, producto.val()));
    });

    datatable.clear().draw();
    arrProductos.forEach(function (producto) {
      var id = producto.id,
          nombre = producto.nombre,
          precioUnitario = producto.precioUnitario;


      filas += '<tr>\n                  <td>' + consorcio + '</td>\n                  <td>' + id + '</td>\n                  <td>' + nombre + '</td>\n                  <td>\n                    <div class="input-group">\n                      <div class="input-group-prepend">\n                        <span class="input-group-text">$</span>\n                      </div>\n                      <input type="text" class="form-control" readonly id="precio-' + id + '" value="' + precioUnitario + '">\n                      <div class="input-group-append">\n                        <button class="btn btn-outline-warning" onclick="editar(\'precio-' + id + '\')" type="button"><i class="fas fa-pencil-alt"></i> Editar</button>\n                        <button class="btn btn-outline-success" onclick="guardarPrecio(\'precio-' + id + '\', \'' + id + '\', \'' + consorcio + '\')" type="button"><i class="fas fa-cloud"></i> Guardar</button>\n                      </div>\n                    </div>\n                  </td>\n                </tr>';
    });
    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editar(idInput) {
  $('#' + idInput).attr('readonly', false);
}

function guardarPrecio(idInput, claveProducto, consorcio) {
  var nuevoPrecio = Number($('#' + idInput).val());

  db.ref('consorcios/' + consorcio + '/productos/' + claveProducto).update({
    precioUnitario: nuevoPrecio
  });
  db.ref('productos/' + consorcio + '/productos/' + claveProducto).update({
    precioUnitario: nuevoPrecio
  });

  $('#' + idInput).attr('readonly', true);

  $.toaster({ priority: 'success', title: 'Mensaje', message: 'El precio se actualiz\xF3 correctamente' });
}