"use strict";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyA19j6-VLNcXLJfBkfd_lZfFFbzg6z0Imc",
  authDomain: "xico-netcontrol.firebaseapp.com",
  databaseURL: "https://xico-netcontrol.firebaseio.com",
  projectId: "xico-netcontrol",
  storageBucket: "xico-netcontrol.appspot.com",
  messagingSenderId: "248615705793"
};
firebase.initializeApp(config);

const db = firebase.database();
const auth = firebase.auth();
let agenteAsignado = "";

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarPedidoPadre();
      mostrarContador();
      mostrarDatos();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function mostrarDatos() {
  let idPedidoPadre = getQueryVariable('id');

  let pedidoPadreRef = db.ref('pedidoPadre/'+idPedidoPadre);
  pedidoPadreRef.on('value', function(snapshot) {
    let datos = snapshot.val();
    $('#numPedido').html(datos.clave);

    let diaCaptura = datos.fechaCreacionPadre.substr(0,2);
    let mesCaptura = datos.fechaCreacionPadre.substr(3,2);
    let añoCaptura = datos.fechaCreacionPadre.substr(6,4);
    let fechaCreacion = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
    moment.locale('es');
    let fechaCreacionMostrar = moment(fechaCreacion).format('LL');
    $('#fechaPedido').html("Recibido el " + fechaCreacionMostrar);
  });
}

function mostrarPedidoPadre() {
	let idPedidoPadre = getQueryVariable('id');
  let tabla = $(`#tablaPedidoSeparar`).DataTable({
    destroy: true,
    language: {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    searching: false,
    ordering: false,
    paging: false,
    info: false,
    responsive: true
  });

  let rutaPedidoPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidoPadre.once('value', function(snapshot) {
    let pedidosHijos = snapshot.val().pedidosHijos;

    let filas = "";
    tabla.clear();
    for(let pedido in pedidosHijos) {
      filas += `<tr>
                  <td>${pedido}</td>
                  <td>${pedidosHijos[pedido].encabezado.numOrden}</td>
                  <td>${pedidosHijos[pedido].encabezado.fechaCaptura}</td>
                  <td>${pedidosHijos[pedido].encabezado.tienda}</td>
                  <td>${pedidosHijos[pedido].encabezado.ruta}</td>
                </tr>`;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

dragula([document.getElementById('tbodyTablaPedidoSeparar'), document.getElementById('tbodyTablaPedidoSeparado')]);
//dragula([document.getElementById('tbodyTablaOrdenes'), document.getElementById('tbodyTablaPedidoPadre')]);

function separar() {
	let idPedidoPadre = getQueryVariable('id');

	
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}lista`);
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = "";

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

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
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

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});