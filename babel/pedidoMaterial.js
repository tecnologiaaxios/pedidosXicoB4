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
  mostrarDatosPedido();
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
    //si hay un usuario
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarDatosPedido() {
  var idPedido = getQueryVariable('id');
  db.ref('pedidosMateriales/' + idPedido).on('value', function (snapshot) {
    var pedido = snapshot.val();
    var materiales = pedido.materiales;

    $('#keyPedido').html(idPedido);
    $('#clavePedido').html('Pedido: ' + pedido.clave);
    $('#tienda').html('' + pedido.tienda);
    var uid = pedido.promotora;
    db.ref('usuarios/tiendas/supervisoras/' + uid).once('value', function (promotora) {
      var nombrePromotora = promotora.val().nombre;

      $('#coordinador').html('' + nombrePromotora);
    });
    var cantidadMateriales = Object.keys(materiales).length;
    $('#cantidad').html('' + cantidadMateriales);

    var diaCaptura = pedido.fechaCaptura.substr(0, 2),
        mesCaptura = pedido.fechaCaptura.substr(3, 2),
        añoCaptura = pedido.fechaCaptura.substr(6, 4),
        fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;

    moment.locale('es');
    var fechaCapturaMostrar = moment(fechaCaptura).format('LL');
    $('#fechaPedido').html('Recibido el ' + fechaCapturaMostrar);
    var datatable = $('#materiales').DataTable({
      destroy: true,
      ordering: false,
      paging: false,
      searching: true,
      dom: 'Bfrtip',
      /* buttons: ['excel'], */
      buttons: [{
        extend: 'excel',
        className: 'btn btn-info',
        text: '<i class="far fa-file-excel"></i> Excel'
      }],
      scrollY: "500px",
      scrollCollapse: true,
      language: LANGUAGE
    });

    var totalCosto = 0,
        totalCantidad = 0;
    var filas = "";
    datatable.clear().draw();
    for (var material in materiales) {
      var datosMaterial = materiales[material];
      totalCosto += datosMaterial.costo;
      totalCantidad += datosMaterial.cantidad;

      filas += '<tr>\n                  <td>' + datosMaterial.clave + '</td>\n                  <td>' + datosMaterial.nombre + '</td>\n                  <td class="text-right">' + datosMaterial.cantidad + '</td>\n                  <td class="text-right">' + datosMaterial.precioUnitario + '</td>\n                  <td class="text-right">' + datosMaterial.costo + '</td>\n                  <td>' + datosMaterial.unidad + '</td>\n                  <td align="center">\n                    <a role="button" class="btn btn-warning btn-xs" onclick="abrirModalEditarMaterial(\'' + material + '\', \'' + datosMaterial.clave + '\')" data-toggle="tooltip" data-placement="top" title="Editar"><i class="fas fa-pencil-alt" aria-hidden="true"></i></a>\n                    <a style="color: white;" role="button" class="btn btn-danger btn-xs" onclick="abrirModalEliminarMaterial(\'' + material + '\', \'' + datosMaterial.clave + '\')" data-toggle="tooltip" data-placement="top" title="Eliminar"><i class="fas fa-trash-alt" aria-hidden="true"></i></a>\n                  </td>\n                </tr>';
    }
    filas += '<tr>\n                <td></td>\n                <td class="text-right"><strong>Totales</strong></td>\n                <td class="text-right"><strong>' + totalCantidad + '</strong></td>\n                <td class="text-right"></td>\n                <td class="text-right"><strong>' + totalCosto + '</strong></td>\n                <td class="text-right"></td>\n                <td class="text-right"></td>\n              </tr>';

    //actualizarTotales(kgTotal, piezaTotal);
    datatable.rows.add($(filas)).columns.adjust().draw();
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
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