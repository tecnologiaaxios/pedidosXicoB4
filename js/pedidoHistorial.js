const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$(document).ready(function() {
  mostrarDatos();
  $('[data-toggle="tooltip"]').tooltip();
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
})

haySesion();

function mostrarDatos() {
  let idPedido = getQueryVariable('id');
  //let historialPedidos = JSON.parse(localStorage.getItem('historialPedidos'));
  localforage.getItem('historialPedidos').then(function(value) {
    let historialPedidos = value;
    
    let datos = historialPedidos[idPedido],
      encabezado = datos.encabezado,
      detalle = datos.detalle,
      fecha = encabezado.fechaCaptura;

    if((encabezado.numOrden != "") && (typeof encabezado.numOrden != "undefined")) {
      $('#contenedorDatos').prepend(`<p id="numOrden" class="lead"><small>Núm. de orden: <strong>${encabezado.numOrden}</strong></small></p>`);
    }

    $('#numPedido').html(`Pedido: ${idPedido}`);
    let diaCaptura = fecha.substr(0,2),
        mesCaptura = fecha.substr(3,2),
        añoCaptura = fecha.substr(6,4),
        fechaCaptura = `${mesCaptura}/${diaCaptura}/${añoCaptura}`;
    
    moment.locale('es');
    let fechaCapturaMostrar = moment(fechaCaptura).format('LL');

    $('#fechaPedido').html(`Recibido el ${fechaCaptura}`);
    $('#tienda').html(`Tienda: ${datos.encabezado.tienda}`);

    let cantidadProductos = encabezado.cantidadProductos;
    $('#cantidad').html(`<small class="lead">${cantidadProductos}</small>`);
    let filas = "", kgTotal = 0, degusTotal = 0, pedidoPzTotal = 0, piezaTotal = 0, precioUnitarioTotal = 0, cambioFisicoTotal = 0;
      
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

    $('#productos tbody').html(filas);

    let datatable = $('#productos').DataTable({
      destroy: true,
      ordering: false,
      paging: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: ['excel'],
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
  }).catch(function(err) {
      console.log(err);
  });
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

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
