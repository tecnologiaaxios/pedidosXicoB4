const db = firebase.database();
const auth = firebase.auth();

const LANGUAGE = {
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
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function haySesion() {
  auth.onAuthStateChanged((user) => {
    //si hay un usuario
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarDatosPedido() {
  let idPedido = getQueryVariable('id');
  db.ref(`pedidosMateriales/${idPedido}`).on('value', (snapshot) => {
    let pedido = snapshot.val();
    let materiales = pedido.materiales;
    
    $('#keyPedido').html(idPedido);
    $('#clavePedido').html(`Pedido: ${pedido.clave}`);
    $('#tienda').html(`${pedido.tienda}`);
    let uid = pedido.promotora;
    db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', (promotora) => {
      let nombrePromotora = promotora.val().nombre;

      $('#coordinador').html(`${nombrePromotora}`);
    });
    let cantidadMateriales = Object.keys(materiales).length;
    $('#cantidad').html(`${cantidadMateriales}`);

    let diaCaptura = pedido.fechaCaptura.substr(0,2),
      mesCaptura = pedido.fechaCaptura.substr(3,2),
      añoCaptura = pedido.fechaCaptura.substr(6,4),
      fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
  
    moment.locale('es');
    let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
    $('#fechaPedido').html(`Recibido el ${fechaCapturaMostrar}`);
    let datatable = $('#materiales').DataTable({
      destroy: true,
      ordering: false,
      paging: false,
      searching: true,
      dom: 'Bfrtip',
      /* buttons: ['excel'], */
      buttons: [
        {
          extend: 'excel',
          className: 'btn btn-info',
          text: '<i class="far fa-file-excel"></i> Excel'
      }],
      scrollY: "500px",
      scrollCollapse: true,
      language: LANGUAGE
    });

    let totalCosto = 0, totalCantidad = 0;
    let filas = "";
    datatable.clear().draw();
    for(let material in materiales) {
      let datosMaterial = materiales[material];
      totalCosto += datosMaterial.costo;
      totalCantidad += datosMaterial.cantidad;
      
      filas += `<tr>
                  <td>${datosMaterial.clave}</td>
                  <td>${datosMaterial.nombre}</td>
                  <td class="text-right">${datosMaterial.cantidad}</td>
                  <td class="text-right">${datosMaterial.precioUnitario}</td>
                  <td class="text-right">${datosMaterial.costo}</td>
                  <td>${datosMaterial.unidad}</td>
                  <td align="center">
                    <a role="button" class="btn btn-warning btn-xs" onclick="abrirModalEditarMaterial('${material}', '${datosMaterial.clave}')" data-toggle="tooltip" data-placement="top" title="Editar"><i class="fas fa-pencil-alt" aria-hidden="true"></i></a>
                    <a style="color: white;" role="button" class="btn btn-danger btn-xs" onclick="eliminarMaterial('${material}')" data-toggle="tooltip" data-placement="top" title="Eliminar"><i class="fas fa-trash-alt" aria-hidden="true"></i></a>
                  </td>
                </tr>`;
    }
    filas += `<tr>
                <td></td>
                <td class="text-right"><strong>Totales</strong></td>
                <td class="text-right"><strong>${totalCantidad}</strong></td>
                <td class="text-right"></td>
                <td class="text-right"><strong>${totalCosto}</strong></td>
                <td class="text-right"></td>
                <td class="text-right"></td>
              </tr>`;

    //actualizarTotales(kgTotal, piezaTotal);
    datatable.rows.add($(filas)).columns.adjust().draw();
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
  });
}

function abrirModalAgregar() {
  $('#modalAgregarMaterial').modal('show');
  llenarSelectMateriales();
}

$('#modalAgregarMateriales').on('hide.bs.modal', () => {
  $('#selectMateriales').val('');
  $('#nombreMateriales').val('');
  $('#empaqueMateriales').val('');
  $('#precioMateriales').val('');
  $('#unidadMateriales').val('');
  $('#cantidadMateriales').val('');
}); 

$('#modalEditarProducto').on('hide.bs.modal', () => {
  $('#nombreEditarMateriales').val('');
  $('#empaqueEditarMateriales').val('');
  $('#precioEditarMateriales').val('');
  $('#unidadEditarMateriales').val('');
  $('#cantidadEditarMateriales').val('');
});

function llenarSelectMateriales() {
  db.ref(`materiales`).on('value', snapshot => {
    let materiales= snapshot.val();
    let options = '<option value="Seleccionar" id="Seleccionar">Seleccionar</option>';
    for(let material in materiales) {
      options += `<option value="${material}"> ${material} ${materiales[material].nombre} ${materiales[material].empaque}</option>`;
    }
    $('#selectMateriales').html(options);
  });
}

$('#selectMateriales').change(function() {
  let idMaterial = $(this).val();

  if(idMaterial != undefined) {
    db.ref(`materiales/${idMaterial}`).on('value', snapshot => {
      let material = snapshot.val();
      $('#nombreMateriales').val(material.nombre);
      $('#empaqueMateriales').val(material.empaque);
      $('#precioUnitarioMateriales').val(material.precioUnitario);
      $('#unidadMateriales').val(material.unidad);
      $('#claveConsorcio').val(material.claveConsorcio);
    });

    if(this.value != null || this.value != undefined) {
      $('#selectMateriales').parent().removeClass('has-error');
      $('#helpblockMateriales').hide();
    } else {
      $('#selectMateriales').parent().addClass('has-error');
      $('#helpblockMateriales').show();
    }
  }
});

$('#cantidadMateriales').change(function() {
  let cantidad = Number($(this).val());
  let precioUnitario = Number($('#precioUnitarioMateriales').val());
  let costo = Number(cantidad * precioUnitario);
  $('#costoMateriales').val(costo)
});

function agregarMaterial() {
  let idPedido = getQueryVariable('id');
  let clave = Number($('#selectMaterialesMateriales').val());
  let nombre = $('#nombreMateriales').val();
  let cantidad = Number($('#cantidadMateriales').val());
  let unidad = $('#unidadMateriales').val();
  let precioUnitario = Number($('#precioUnitarioMateriales').val());
  let costo = cantidad * precioUnitario;

  if(clave != undefined && clave != null && cantidad > 0) {
    db.ref(`pedidosMateriales/${idPedido}`).once('value', snapshot => {
      let materiales = snapshot.val().materiales;
      let arrMateriales = [];
      materiales.forEach(material => {
        arrMateriales.push(material.clave);
      });
      if(arrMateriales.includes(clave)) {
        $.toaster({priority: 'warning', title: 'Mensaje de información', message: `El material ${clave} ya se encuentra en el pedido`});
      }
      else {
        db.ref(`pedidosMateriales/${idPedido}/materiales`).push({
          clave,
          nombre,
          cantidad,
          unidad,
          costo: Number(costo),
          precioUnitario
        });
        $.toaster({priority: 'success', title: 'Mensaje de información', message: `Se agregó el material ${claveProducto} al pedido`});
        limpiarCampos();
        $('#modalAgregarMaterial').modal('hide');
      }
    });
  }
  else {
    if(clave == null || clave == undefined || clave == "Seleccionar") {
      $('#selectMateriales').parent().addClass('has-error');
      $('#helpblockMateriales').show();
    }
    else {
      $('#selectMateriales').parent().removeClass('has-error');
      $('#helpblockMateriales').hide();
    }
    if(cantidad < 1) {
      $('#cantidadMateriales').parent().addClass('has-error');
      $('#helpblockCantidadMateriales').show();
    }
    else {
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
  let idPedido = getQueryVariable('id');
  db.ref(`pedidosMateriales/${idPedido}/materiales/${idMaterial}`).once('value', snapshot => {
    let material = snapshot.val();
    $('#nombreMaterialEditar').val(material.nombre);
    $('#cantidadMaterialEditar').val(material.cantidad);
    $('#unidadMaterialEditar').val(material.unidad);
    $('#precioUnitarioMaterialEditar').val(material.precioUnitario);
  });

  $('#modalEditarMaterial').modal('show');
  $('#btnActualizarMaterial').attr('onclick', `editarMaterial("${idMaterial}")`);
}

$('#cantidadMaterialEditar').change(function() {
  let cantidad = Number($(this).val());
  let precioUnitario = Number($('#precioUnitarioMaterialEditar').val());
  let costo = Number(cantidad * precioUnitario);
  $('#costoMaterialEditar').val(costo)
});

function editarMaterial(idMaterial) {
  let idPedido = getQueryVariable('id');
  let cantidad = Number($('#cantidadMaterialEditar').val());
  let precioUnitario = $('#precioUnitarioMaterialEditar').val();
  
  if(cantidad > 0) {
    let costo = cantidad * precioUnitario;
    db.ref(`pedidosMateriales/${idPedido}/materiales/${idMaterial}`).update({
      cantidad,
      costo
    });

    $('#modalEditarMaterial').modal('hide');
    $.toaster({priority: 'info', title: 'Mensaje de información', message: `El material ${idMaterial} se actualizó correctamente`});
  }
  else {
    $.toaster({priority: 'warning', title: 'Mensaje de información', message: `La cantidad no puede ser 0`});
  }
}

function eliminarMaterial(idMaterial) {
  swal({
    title: "¿Está seguro de eliminar este material?",
    text: "",
    icon: "warning",
    buttons: true,
    confirm: true,
  })
  .then((will) => {
    if (will) {
      let idPedido = getQueryVariable('id');
      db.ref(`pedidosMateriales/${idPedido}/materiales`).child(idMaterial).remove();

      swal("El material se ha eliminado", {
        icon: "success",
      });
    }
  });
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
  notificacionesRef.on('value', function (snapshot) {
    let lista = snapshot.val();
    let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    let arrayNotificaciones = [];
    for (let notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for (let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += `<li>
                <a>
                  <div>
                    <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                    <span class="pull-right text-muted small">${fecha}</span>
                  </div>
                </a>
              </li>`;
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.on('value', function (snapshot) {
    let cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}