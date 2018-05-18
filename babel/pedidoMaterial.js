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

      filas += '<tr>\n                  <td>' + datosMaterial.clave + '</td>\n                  <td>' + datosMaterial.nombre + '</td>\n                  <td class="text-right">' + datosMaterial.cantidad + '</td>\n                  <td class="text-right">' + datosMaterial.precioUnitario + '</td>\n                  <td class="text-right">' + datosMaterial.costo + '</td>\n                  <td>' + datosMaterial.unidad + '</td>\n                  <td align="center">\n                    <a role="button" class="btn btn-warning btn-xs" onclick="abrirModalEditarMaterial(\'' + material + '\', \'' + datosMaterial.clave + '\')" data-toggle="tooltip" data-placement="top" title="Editar"><i class="fas fa-pencil-alt" aria-hidden="true"></i></a>\n                    <a style="color: white;" role="button" class="btn btn-danger btn-xs" onclick="eliminarMaterial(\'' + material + '\')" data-toggle="tooltip" data-placement="top" title="Eliminar"><i class="fas fa-trash-alt" aria-hidden="true"></i></a>\n                  </td>\n                </tr>';
    }
    filas += '<tr>\n                <td></td>\n                <td class="text-right"><strong>Totales</strong></td>\n                <td class="text-right"><strong>' + totalCantidad + '</strong></td>\n                <td class="text-right"></td>\n                <td class="text-right"><strong>' + totalCosto + '</strong></td>\n                <td class="text-right"></td>\n                <td class="text-right"></td>\n              </tr>';

    //actualizarTotales(kgTotal, piezaTotal);
    datatable.rows.add($(filas)).columns.adjust().draw();
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
  });
}

function abrirModalAgregar() {
  $('#modalAgregarMaterial').modal('show');
  llenarSelectMateriales();
}

$('#modalAgregarMateriales').on('hide.bs.modal', function () {
  $('#selectMateriales').val('');
  $('#nombreMateriales').val('');
  $('#empaqueMateriales').val('');
  $('#precioMateriales').val('');
  $('#unidadMateriales').val('');
  $('#cantidadMateriales').val('');
});

$('#modalEditarProducto').on('hide.bs.modal', function () {
  $('#nombreEditarMateriales').val('');
  $('#empaqueEditarMateriales').val('');
  $('#precioEditarMateriales').val('');
  $('#unidadEditarMateriales').val('');
  $('#cantidadEditarMateriales').val('');
});

function llenarSelectMateriales() {
  db.ref('materiales').on('value', function (snapshot) {
    var materiales = snapshot.val();
    var options = '<option value="Seleccionar" id="Seleccionar">Seleccionar</option>';
    for (var material in materiales) {
      options += '<option value="' + material + '"> ' + material + ' ' + materiales[material].nombre + ' ' + materiales[material].empaque + '</option>';
    }
    $('#selectMateriales').html(options);
  });
}

$('#selectMateriales').change(function () {
  var idMaterial = $(this).val();

  if (idMaterial != undefined) {
    db.ref('materiales/' + idMaterial).on('value', function (snapshot) {
      var material = snapshot.val();
      $('#nombreMateriales').val(material.nombre);
      $('#empaqueMateriales').val(material.empaque);
      $('#precioUnitarioMateriales').val(material.precioUnitario);
      $('#unidadMateriales').val(material.unidad);
      $('#claveConsorcio').val(material.claveConsorcio);
    });

    if (this.value != null || this.value != undefined) {
      $('#selectMateriales').parent().removeClass('has-error');
      $('#helpblockMateriales').hide();
    } else {
      $('#selectMateriales').parent().addClass('has-error');
      $('#helpblockMateriales').show();
    }
  }
});

$('#cantidadMateriales').change(function () {
  var cantidad = Number($(this).val());
  var precioUnitario = Number($('#precioUnitarioMateriales').val());
  var costo = Number(cantidad * precioUnitario);
  $('#costoMateriales').val(costo);
});

function agregarMaterial() {
  var idPedido = getQueryVariable('id');
  var clave = Number($('#selectMaterialesMateriales').val());
  var nombre = $('#nombreMateriales').val();
  var cantidad = Number($('#cantidadMateriales').val());
  var unidad = $('#unidadMateriales').val();
  var precioUnitario = Number($('#precioUnitarioMateriales').val());
  var costo = cantidad * precioUnitario;

  if (clave != undefined && clave != null && cantidad > 0) {
    db.ref('pedidosMateriales/' + idPedido).once('value', function (snapshot) {
      var materiales = snapshot.val().materiales;
      var arrMateriales = [];
      materiales.forEach(function (material) {
        arrMateriales.push(material.clave);
      });
      if (arrMateriales.includes(clave)) {
        $.toaster({ priority: 'warning', title: 'Mensaje de información', message: 'El material ' + clave + ' ya se encuentra en el pedido' });
      } else {
        db.ref('pedidosMateriales/' + idPedido + '/materiales').push({
          clave: clave,
          nombre: nombre,
          cantidad: cantidad,
          unidad: unidad,
          costo: Number(costo),
          precioUnitario: precioUnitario
        });
        $.toaster({ priority: 'success', title: 'Mensaje de información', message: 'Se agreg\xF3 el material ' + claveProducto + ' al pedido' });
        limpiarCampos();
        $('#modalAgregarMaterial').modal('hide');
      }
    });
  } else {
    if (clave == null || clave == undefined || clave == "Seleccionar") {
      $('#selectMateriales').parent().addClass('has-error');
      $('#helpblockMateriales').show();
    } else {
      $('#selectMateriales').parent().removeClass('has-error');
      $('#helpblockMateriales').hide();
    }
    if (cantidad < 1) {
      $('#cantidadMateriales').parent().addClass('has-error');
      $('#helpblockCantidadMateriales').show();
    } else {
      $('#cantidadMateriales').parent().removeClass('has-error');
      $('#helpblockCantidadMateriales').hide();
    }
  }
}

function limpiarCampos() {
  $('#selectMateriales').val('');
  $('#nombreMateriales').val('');
  $('#cantidadMateriales').val('');
  $('#empaqueMateriales').val('');
  $('#unidadMateriales').val('');
  $('#precioUnitarioMateriales').val('');
}

function abrirModalEditarMaterial(idMaterial) {
  var idPedido = getQueryVariable('id');
  db.ref('pedidosMateriales/' + idPedido + '/materiales/' + idMaterial).once('value', function (snapshot) {
    var material = snapshot.val();
    $('#nombreMaterialEditar').val(material.nombre);
    $('#cantidadMaterialEditar').val(material.cantidad);
    $('#unidadMaterialEditar').val(material.unidad);
    $('#precioUnitarioMaterialEditar').val(material.precioUnitario);
  });

  $('#modalEditarMaterial').modal('show');
  $('#btnActualizarMaterial').attr('onclick', 'editarMaterial("' + idMaterial + '")');
}

$('#cantidadMaterialEditar').change(function () {
  var cantidad = Number($(this).val());
  var precioUnitario = Number($('#precioUnitarioMaterialEditar').val());
  var costo = Number(cantidad * precioUnitario);
  $('#costoMaterialEditar').val(costo);
});

function editarMaterial(idMaterial) {
  var idPedido = getQueryVariable('id');
  var cantidad = Number($('#cantidadMaterialEditar').val());
  var precioUnitario = $('#precioUnitarioMaterialEditar').val();

  if (cantidad > 0) {
    var costo = cantidad * precioUnitario;
    db.ref('pedidosMateriales/' + idPedido + '/materiales/' + idMaterial).update({
      cantidad: cantidad,
      costo: costo
    });

    $('#modalEditarMaterial').modal('hide');
    $.toaster({ priority: 'info', title: 'Mensaje de información', message: 'El material ' + idMaterial + ' se actualiz\xF3 correctamente' });
  } else {
    $.toaster({ priority: 'warning', title: 'Mensaje de información', message: 'La cantidad no puede ser 0' });
  }
}

function eliminarMaterial(idMaterial) {
  swal({
    title: "¿Está seguro de eliminar este material?",
    text: "",
    icon: "warning",
    buttons: true,
    confirm: true
  }).then(function (will) {
    if (will) {
      var idPedido = getQueryVariable('id');
      db.ref('pedidosMateriales/' + idPedido + '/materiales').child(idMaterial).remove();

      swal("El material se ha eliminado", {
        icon: "success"
      });
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