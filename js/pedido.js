const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  /* let idPedido = getQueryVariable('id');
  let pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
  mostrarDatos(pedidos[idPedido]); */

  let idPedido = getQueryVariable('id');
  db.ref(`pedidoEntrada/${idPedido}`).on('value', (datos) => {
    let pedido = datos.val();
    mostrarDatos(pedido)
  });
});

function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    if (user) { //si hay un usuario
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

$('#btnPerfil').click( function(e) {
  e.preventDefault();

  $('#modalPerfil').modal('show');
});

function mostrarDatos(pedido) {
  let idPedido = getQueryVariable('id');
  let datatable = $('#productos').DataTable({
    destroy: true,
    ordering: false,
    paging: false,
    searching: false,
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
    language: {
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
        sSortAscending:
          ': Activar para ordenar la columna de manera ascendente',
        sSortDescending:
          ': Activar para ordenar la columna de manera descendente'
      }
    }
  });

  /*let datos = pedidos[idPedido],
      encabezado = datos.encabezado,
      detalle = datos.detalle,
      fecha = encabezado.fechaCaptura; */
  let encabezado = pedido.encabezado,
      detalle = pedido.detalle,
      fecha = encabezado.fechaCaptura;

  if((encabezado.numOrden != "") && (typeof encabezado.numOrden != "undefined")) {
    $('#contenedorDatos').prepend(`<p id="numOrden" class="lead"><small>Núm. de orden: <strong>${encabezado.numOrden}</strong></small></p>`);
  }

  $('#keyPedido').html(`${idPedido}`);
  $('#clavePedido').html(`Pedido: ${encabezado.clave}`);
  let diaCaptura = fecha.substr(0,2),
      mesCaptura = fecha.substr(3,2),
      añoCaptura = fecha.substr(6,4),
      fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
  
  moment.locale('es');
  let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
    
  $('#fechaPedido').html(`Enviado de: ${encabezado.ruta}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Recibido el ${fechaCapturaMostrar}`);
  $('#tienda').html(`${encabezado.tienda}`);

  let uid = encabezado.promotora;
  db.ref(`usuarios/tiendas/supervisoras/${uid}`).once('value', (promotora) => {
    let nombrePromotora = promotora.val().nombre;

    $('#coordinador').html(`${nombrePromotora}`);
  });

  let cantidadProductos = Object.keys(detalle).length;
  
  $('#cantidad').html(`<small class="lead">${cantidadProductos}</small>`);
  let filas = "", kgTotal = 0, degusTotal = 0, pedidoPzTotal = 0, piezaTotal = 0, precioUnitarioTotal = 0, cambioFisicoTotal = 0;
  datatable.clear();
  for(let producto in detalle) {
    let datosProducto = detalle[producto];
    kgTotal += datosProducto.totalKg;
    degusTotal += datosProducto.degusPz;
    pedidoPzTotal += datosProducto.pedidoPz;
    piezaTotal += datosProducto.totalPz;
    precioUnitarioTotal += datosProducto.precioUnitario;
    cambioFisicoTotal += datosProducto.cambioFisicoPz;
    filas += `<tr>
                <td class="text-center">${datosProducto.clave}</td>
                <td>${datosProducto.nombre}</td>
                <td class="text-right">${datosProducto.pedidoPz}</td>
                <td class="text-right">${datosProducto.degusPz}</td>
                <td class="text-right">${datosProducto.cambioFisicoPz}</td>
                <td class="text-right">${datosProducto.totalPz}</td>
                <td class="text-right">${datosProducto.totalKg}</td>
                <td class="text-right">$ ${datosProducto.precioUnitario}</td>
                <td class="text-center">${datosProducto.unidad}</td>
                <td class="text-center"><button class="btn btn-warning btn-xs" onclick="abrirModalEditarProducto('${producto}', '${datosProducto.clave}')"><i class="fas fa-pencil-alt" aria-hidden="true"></i></button></td>
                <td class="text-center"><button class="btn btn-danger btn-xs" onclick="abrirModalEliminarProducto('${producto}', '${datosProducto.clave}')"><i class="fas fa-trash-alt" aria-hidden="true"></i></button></td>
              </tr>`;
  }
  filas += `<tr>
              <td></td>
              <td class="text-right"><strong>Totales</strong></td>
              <td class="text-right"><strong>${pedidoPzTotal}</strong></td>
              <td class="text-right"><strong>${degusTotal}</strong></td>
              <td class="text-right"><strong>${cambioFisicoTotal}</strong></td>
              <td class="text-right"><strong>${piezaTotal}</strong></td>
              <td class="text-right"><strong>${kgTotal.toFixed(4)}</strong></td>
              <td class="text-right"><strong>$ ${precioUnitarioTotal.toFixed(4)}</strong></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`;

  //$('#productos tbody').html(filas);
  actualizarTotales(kgTotal, piezaTotal);
  datatable.rows.add($(filas)).columns.adjust().draw();
  datatable.buttons().container()
        .appendTo( '#example_wrapper .col-md-6:eq(0)' );

        $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
}

function actualizarTotales(kilos, piezas) {
  let idPedido = getQueryVariable('id');
  db.ref(`pedidoEntrada/${idPedido}/encabezado`).update({
    totalKilos: kilos.toFixed(4),
    totalPiezas: piezas
  });
}

function abrirModal() {
  $('#modalAgregarProducto').modal('show');
  llenarSelectProductos();
}

$('#modalAgregarProducto').on('hide.bs.modal', () => {
  $('#listaProductos').val('');
  $('#nombre').val('');
  $('#claveConsorcio').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisicoPz').val('');
  $('#empaque').val('');
  $('#precioUnitario').val('');
  $('#unidad').val('');
  $('#totalPz').val('');
  $('#totalKg').val('');
});

$('#modalEditarProducto').on('hide.bs.modal', () => {
  $('#nombreEditar').val('');
  $('#claveConsorcioEditar').val('');
  $('#pedidoPzEditar').val('');
  $('#degusPzEditar').val('');
  $('#cambioFisicoPzEditar').val('');
  $('#empaqueEditar').val('');
  $('#precioUnitarioEditar').val('');
  $('#unidadEditar').val('');
  $('#totalPzEditar').val('');
  $('#totalKgEditar').val('');
});

function llenarSelectProductos() {
  let idPedido = getQueryVariable('id');
  let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}`);
  pedidoEntradaRef.on('value', function(snapshot) {
    let consorcio = snapshot.val().encabezado.consorcio;

    let productosRef = db.ref(`productos/${consorcio}`);
    productosRef.on('value', function(snapshot) {
      let productos = snapshot.val();
      let options = '<option value="Seleccionar" id="SeleccionarProducto">Seleccionar</option>';
      for(let producto in productos) {
        options += `<option value="${producto}"> ${producto} ${productos[producto].nombre} ${productos[producto].empaque}</option>`;
      }
      $('#listaProductos').html(options);
    });
  })
}

$('#listaProductos').change(function() {
  let idProducto = $(this).val();

  if(idProducto != undefined) {
    let idPedido = getQueryVariable('id');
    let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}`);
    pedidoEntradaRef.on('value', function(snapshot) {
      let consorcio = snapshot.val().encabezado.consorcio;

      let productoActualRef = db.ref(`productos/${consorcio}/${idProducto}`);
      productoActualRef.on('value', function(snapshot) {
        let producto = snapshot.val();
        $('#nombre').val(producto.nombre);
        $('#empaque').val(producto.empaque);
        $('#precioUnitario').val(producto.precioUnitario);
        $('#unidad').val(producto.unidad);
        $('#claveConsorcio').val(producto.claveConsorcio);

        $('#pedidoPz').val('');
        $('#degusPz').val('');
        $('#cambioFisicoPz').val('');
        $('#totalKg').val('');
        $('#totalPz').val('');
      });
    });

    if(this.value != null || this.value != undefined) {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    } else {
      $('#productos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
  }
});

$('#pedidoPz').keyup(function(){
  let pedidoPz = Number($(this).val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);

  if(this.value.length < 1) {
    $('#pedidoPz').parent().addClass('has-error');
    $('#helpblockPedidoPz').show();
  }
  else {
    $('#pedidoPz').parent().removeClass('has-error');
    $('#helpblockPedidoPz').hide();
  }
});

$("#pedidoPz").bind('keyup change click', function (e) {
  if (! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($(this).val());
    let degusPz = Number($('#degusPz').val());
    let cambioFisicoPz = Number($('#cambioFisicoPz').val());
    let empaque = Number($('#empaque').val());
    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);
  
    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);
  
    if(this.value.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    }
    else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
});

$('#degusPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($(this).val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$("#degusPz").bind('keyup change click', function (e) {
  if(! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($("#pedidoPz").val());
    let degusPz = Number($(this).val());
    let cambioFisicoPz = Number($('#cambioFisicoPz').val());
    let empaque = Number($('#empaque').val());
    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);

    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);
  }
});

$('#cambioFisicoPz').keyup(function(){
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($(this).val());
  if(cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisicoPz = 0;
  }
  let empaque = Number($('#empaque').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPz').val(totalPz);
  $('#totalKg').val(totalKg);
});

$("#cambioFisicoPz").bind('keyup change click', function (e) {
  if(! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($('#pedidoPz').val());
    let degusPz = Number($('#degusPz').val());
    let cambioFisicoPz = Number($(this).val());
    if(cambioFisicoPz == undefined || cambioFisicoPz == null) {
      cambioFisicoPz = 0;
    }
    let empaque = Number($('#empaque').val());
    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);

    $('#totalPz').val(totalPz);
    $('#totalKg').val(totalKg);
  }
});

function agregarProducto() {
  let idPedido = getQueryVariable('id');
  let claveProducto = $('#listaProductos').val();
  let nombre = $('#nombre').val();
  let pedidoPz = Number($('#pedidoPz').val());
  let degusPz = Number($('#degusPz').val());
  let cambioFisicoPz = Number($('#cambioFisicoPz').val());
  let unidad = $('#unidad').val();
  let empaque = Number($('#empaque').val());
  let totalKg = Number($('#totalKg').val());
  let totalPz = Number($('#totalPz').val());
  let precioUnitario = Number($('#precioUnitario').val());
  let claveConsorcio = $('#claveConsorcio').val();
  let pedidoKg = pedidoPz * empaque;

  if(claveProducto != null && claveProducto != undefined && claveProducto != "Seleccionar" && $('#pedidoPz').val().length > 0) {
    if(cambioFisicoPz.length < 1) {
      cambioFisicoPz = 0;
    }
    if(degusPz.length < 1) {
      degusPz = 0;
    }
    let cambioFisicoKg = cambioFisicoPz * empaque;
    let degusKg = degusPz * empaque;

    let datosProducto = {
      cambioFisicoPz: cambioFisicoPz,
      cambioFisicoKg: cambioFisicoKg,
      clave: claveProducto,
      claveConsorcio: claveConsorcio,
      degusKg: degusKg,
      degusPz: degusPz,
      empaque: empaque,
      nombre: nombre,
      pedidoPz: pedidoPz,
      pedidoKg: pedidoKg,
      precioUnitario: precioUnitario,
      totalKg: totalKg,
      totalPz: totalPz,
      unidad: unidad
    }

    let claves = [];

    let $filas = $('#tbodyProductos').children('tr'); //arreglo de hijos (filas)
    $filas.each(function () {
      let clave = $(this)[0].cells[0].innerHTML;
      claves.push(clave);
    });

    if(claves.includes(claveProducto)) {
      $.toaster({priority: 'warning', title: 'Mensaje de información', message: `El producto ${claveProducto} ya se encuentra en el pedido`});
    }
    else {
      let pedidoEntradaRef = db.ref(`pedidoEntrada/${idPedido}/detalle`);
      pedidoEntradaRef.push(datosProducto);

      $.toaster({priority: 'success', title: 'Mensaje de información', message: `Se agregó el producto ${claveProducto} al pedido`});

      limpiarCampos();

      $('#modalAgregarProducto').modal('hide');
    }
  }
  else {
    if(claveProducto == null || claveProducto == undefined || claveProducto == "Seleccionar") {
      $('#listaProductos').parent().addClass('has-error');
      $('#helpblockProductos').show();
    }
    else {
      $('#productos').parent().removeClass('has-error');
      $('#helpblockProductos').hide();
    }
    if(pedidoPz.length < 1) {
      $('#pedidoPz').parent().addClass('has-error');
      $('#helpblockPedidoPz').show();
    }
    else {
      $('#pedidoPz').parent().removeClass('has-error');
      $('#helpblockPedidoPz').hide();
    }
  }
}

function limpiarCampos() {
  $('#listaProductos').val('');
  $('#nombre').val('');
  $('#pedidoPz').val('');
  $('#degusPz').val('');
  $('#cambioFisicoPz').val('');
  $('#unidad').val('');
  $('#empaque').val('');
  $('#totalKg').val('');
  $('#totalPz').val('');
  $('#precioUnitario').val('');
  $('#claveConsorcio').val('');
}

function abrirModalEditarProducto(idProducto, claveProducto) {
  let idPedido = getQueryVariable('id');
  let pedidoRef = db.ref(`pedidoEntrada/${idPedido}`);
  pedidoRef.once('value', function(snapshot) {
    let consorcio = snapshot.val().encabezado.consorcio;

    let empaqueRef = db.ref(`productos/${consorcio}/${claveProducto}`);
    empaqueRef.once('value', function(snapshot) {
      let empaque = snapshot.val().empaque;

      let productoRef = db.ref(`pedidoEntrada/${idPedido}/detalle/${idProducto}`);
      productoRef.once('value', function(snapshot) {
        let producto = snapshot.val();

        $('#nombreEditar').val(producto.nombre);
        $('#pedidoPzEditar').val(producto.pedidoPz);
        $('#degusPzEditar').val(producto.degusPz);
        $('#cambioFisicoPzEditar').val(producto.cambioFisicoPz);
        $('#unidadEditar').val(producto.unidad);
        $('#empaqueEditar').val(empaque);
        $('#totalKgEditar').val(producto.totalKg);
        $('#totalPzEditar').val(producto.totalPz);
        $('#precioUnitarioEditar').val(producto.precioUnitario);
        $('#claveConsorcioEditar').val(producto.claveConsorcio);
      });

      $('#modalEditarProducto').modal('show');
      $('#btnActualizarProducto').attr('onclick', `editarProducto("${idProducto}")`);
    })
  });
}

$('#pedidoPzEditar').keyup(function(){
  let pedidoPz = Number($(this).val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  let empaque = Number($('#empaqueEditar').val());

  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);

  if(this.value.length < 1) {
    $('#pedidoPzEditar').parent().addClass('has-error');
    $('#helpblockPedidoPzEditar').show();
  }
  else {
    $('#pedidoPzEditar').parent().removeClass('has-error');
    $('#helpblockPedidoPzEditar').hide();
  }
});

$("#pedidoPzEditar").bind('keyup change click', function (e) {
  if(! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($(this).val());
    let degusPz = Number($('#degusPzEditar').val());
    let cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
    let empaque = Number($('#empaqueEditar').val());

    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);

    if(this.value.length < 1) {
      $('#pedidoPzEditar').parent().addClass('has-error');
      $('#helpblockPedidoPzEditar').show();
    }
    else {
      $('#pedidoPzEditar').parent().removeClass('has-error');
      $('#helpblockPedidoPzEditar').hide();
    }
  }
});

$('#degusPzEditar').keyup(function(){
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($(this).val());
  let cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$("#degusPzEditar").bind('keyup change click', function (e) {
  if(! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($('#pedidoPzEditar').val());
    let degusPz = Number($(this).val());
    let cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
    let empaque = Number($('#empaqueEditar').val());
    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);
  }
});

$('#cambioFisicoPzEditar').keyup(function(){
  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisicoPz = Number($(this).val());
  if(cambioFisicoPz == undefined || cambioFisicoPz == null) {
    cambioFisico = 0;
  }
  let empaque = Number($('#empaqueEditar').val());
  let totalPz = pedidoPz+degusPz+cambioFisicoPz;
  let totalKg = (totalPz*empaque).toFixed(4);

  $('#totalPzEditar').val(totalPz);
  $('#totalKgEditar').val(totalKg);
});

$("#cambioFisicoPzEditar").bind('keyup change click', function (e) {
  if(! $(this).data("previousValue") || $(this).data("previousValue") != $(this).val()) {
    let pedidoPz = Number($('#pedidoPzEditar').val());
    let degusPz = Number($('#degusPzEditar').val());
    let cambioFisicoPz = Number($(this).val());
    if(cambioFisicoPz == undefined || cambioFisicoPz == null) {
      cambioFisico = 0;
    }
    let empaque = Number($('#empaqueEditar').val());
    let totalPz = pedidoPz+degusPz+cambioFisicoPz;
    let totalKg = (totalPz*empaque).toFixed(4);

    $('#totalPzEditar').val(totalPz);
    $('#totalKgEditar').val(totalKg);
  }
});

function editarProducto(idProducto) {
  let idPedido = getQueryVariable('id');
  let productoRef = db.ref(`pedidoEntrada/${idPedido}/detalle/${idProducto}`);

  let pedidoPz = Number($('#pedidoPzEditar').val());
  let degusPz = Number($('#degusPzEditar').val());
  let cambioFisicoPz = Number($('#cambioFisicoPzEditar').val());
  let empaque = Number($('#empaqueEditar').val());
  let totalKg = Number($('#totalKgEditar').val());
  let totalPz = Number($('#totalPzEditar').val());
  let cambioFisicoKg = cambioFisicoPz * empaque;
  let degusKg = degusPz * empaque;
  let pedidoKg = pedidoPz * empaque;

  productoRef.update({
    pedidoPz: pedidoPz,
    degusPz: degusPz,
    cambioFisicoPz: cambioFisicoPz,
    empaque: empaque,
    totalKg: totalKg,
    totalPz: totalPz,
    cambioFisicoKg: cambioFisicoKg,
    degusKg: degusKg,
    pedidoKg: pedidoKg
  });

  $('#modalEditarProducto').modal('hide');
  $.toaster({priority: 'info', title: 'Mensaje de información', message: `El producto ${idProducto} se actualizó correctamente`});
}

function abrirModalEliminarProducto(idProducto, claveProducto) {
  $('#modalConfirmarEliminarProducto').modal('show');
  $('#btnConfirmar').attr('onclick', `eliminarProducto("${idProducto}", "${claveProducto}")`);
}

function eliminarProducto(idProducto, claveProducto) {
  let idPedido = getQueryVariable('id');
  db.ref(`pedidoEntrada/${idPedido}/detalle`).child(idProducto).remove();
  $.toaster({priority: 'success', title: 'Mensaje de información', message: `El producto ${claveProducto} fue eliminado con exito de este pedido`});
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for(let i in arrayNotificaciones) {
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
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
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
  notificacionesRef.update({cont: 0});
}

$('#campana').click(function() {
  verNotificaciones();
});

function generarPDF(){
    let contenido= document.getElementById('panel').innerHTML;
    let contenidoOriginal= document.body.innerHTML;
    document.body.innerHTML = contenido;
    window.print();
    document.body.innerHTML = contenidoOriginal;
}
/*function generarPDF() {
  let pdf = new jsPDF('p', 'in', 'letter');

  var source = $('#panel')[0];
  var specialElementHandlers = {
    '#bypassme': function(element, renderer) {
    return true;
    }
  };

  pdf.fromHTML(
    source, // HTML string or DOM elem ref.
    0.5, // x coord
    0.5, // y coord
    {
    'width': 7.5, // max width of content on PDF
    'elementHandlers': specialElementHandlers
  });

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/

/*function generarPDF() {
  let pdf = new jsPDF();

  pdf.fromHTML($('#panel').get(0), 10, 10, {'width': 180});
  //pdf.autoPrint();
  //pdf.output("dataurlnewwindow"); // this opens a new popup,  after this the PDF opens the print window view but there are browser inconsistencies with how this is handled

  var string = pdf.output('datauristring');
  var iframe = "<iframe width='100%' height='100%' src='" + string + "'></iframe>"
  var x = window.open();
  x.document.open();
  x.document.write(iframe);
  x.document.close();
}*/
