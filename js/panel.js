"use strict";

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

const LANGUAGE = {
  searchPlaceholder: "Buscar pedido",
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
    sSortAscending:
      ': Activar para ordenar la columna de manera ascendente',
    sSortDescending:
      ': Activar para ordenar la columna de manera descendente'
  }
};

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });

 /*  db.ref('pedidoEntrada').orderByKey('agrupado').equalTo('true').on('value', (pedidos) => {
    let datos = pedidos.val();
    let arrayPedidos = [];
    pedidos.forEach((pedido) => {
      arrayPedidos.unshift({
        id: pedido.key,
        ...pedido.val()
      })
    })
  }) */

 /*  db.ref('estadisticasProductos').on('value', function(snapshot) {
    let arrayProductos = [];
    snapshot.forEach((producto) => {
      arrayProductos.push(producto.val())
    });

    localforage.setItem('estadisticasProductos', arrayProductos, err => {
      console.log(err ? err : 'Estadisticas guardadas en localforage')
    });
  }); */

  /* db.ref('regiones').once('value', (regiones) => {
    let zonas = regiones.val(); */
    //localStorage.setItem('zonas', JSON.stringify(zonas)); //Se usa para llenar el select de zonas en las estadisticas
  
    /* localforage.setItem('zonas', zonas, err => {
      console.log(err ? err : 'Zonas guardadas en localforage')
    });
  }); */

  db.ref('pedidoEntrada').limitToLast(100).on('value', (pedidos) => {
    let datos = pedidos.val();
    let arrayPedidos = [], arrayHistorialPedidos = [], arrayPedidosFiltrar = [];

    pedidos.forEach((pedido) => {
      let agrupado = pedido.val().encabezado.agrupado;
      /* arrayPedidosFiltrar.unshift({
        id: pedido.key,
        ...pedido.val()
      }); */

      if ((typeof agrupado != "undefined") && (agrupado == false)) {
        arrayPedidos.unshift({
          id: pedido.key,
          ...pedido.val()
        });
      }
      if(agrupado) {
        arrayHistorialPedidos.unshift({
          id: pedido.key,
          ...pedido.val()
        });
      }
    });

    //localStorage.setItem('pedidos', JSON.stringify(arrayPedidos)); //se usa para mostrar los pedidos recibidos
    localforage.setItem('pedidos', arrayPedidos, err => {
      console.log(err ? err : 'Pedidos guardados en localforage')
      mostrarPedidos();
    });

    //localStorage.setItem('filtrarPedidos', JSON.stringify(arrayPedidosFiltrar)); //Se usa para filtrar los pedidos
    /* localforage.setItem('filtrarPedidos', arrayPedidosFiltrar, err => {
      console.log(err ? err : 'Pedidos para filtrar guardados en localforage')
    }); */

    //localStorage.setItem('pedidosEntrada', JSON.stringify(datos));
    localforage.setItem('pedidosEntrada', datos, err => {
      console.log(err ? err : 'Pedidos entrada guardados en localforage')
    });
    
    //localStorage.setItem('historialPedidos', JSON.stringify(arrayHistorialPedidos));
    localforage.setItem('historialPedidos', arrayHistorialPedidos, err => {
      console.log(err ? err : 'Pedidos de historial guardados en localforage')

      mostrarHistorialPedidos();
    });
  });

  //mostrarPedidos();

  db.ref('pedidoPadre').on('value', (pedidos) => {
    let pedidosPadre = pedidos.val();
    let arrayPedidosEnProceso = [], arrayPedidosVerificados = [], arrayPedidosCargados = [], arrayPedidosFinalizados = [];
    pedidos.forEach((pedido) => {
      let estado = pedido.val().estado;
      if (estado === "En proceso") {
        arrayPedidosEnProceso.unshift({
          id: pedido.key,
          ...pedido.val()
        });
      }
      if(estado === "Verificado") {
        arrayPedidosVerificados.unshift({
          id: pedido.key,
          ...pedido.val()
        });
      }
      if(estado === "Cargado") {
        arrayPedidosCargados.unshift({
          id: pedido.key,
          ...pedido.val()
        });
      }
      if(estado === "Finalizado") {
        arrayPedidosFinalizados.unshift({
          id: pedido.key,
          ...pedido.val()
        }) 
      }
    });
    /* localStorage.setItem('pedidosEnProceso', JSON.stringify(arrayPedidosEnProceso));
    localStorage.setItem('pedidosVerificados', JSON.stringify(arrayPedidosVerificados));
    localStorage.setItem('pedidosCargados', JSON.stringify(arrayPedidosCargados));
    localStorage.setItem('pedidosFinalizados', JSON.stringify(arrayPedidosFinalizados));
    localStorage.setItem('pedidosPadre', JSON.stringify(pedidosPadre)); */

    localforage.setItem('pedidosEnProceso', arrayPedidosEnProceso, err => {
      console.log(err ? err : 'Pedidos en proceso guardadas en localforage')
      mostrarPedidosEnProceso()
    });
    localforage.setItem('pedidosVerificados', arrayPedidosVerificados, err => {
      console.log(err ? err : 'Pedidos verificados guardadas en localforage')
      mostrarPedidosVerificados()
    });
    localforage.setItem('pedidosCargados', arrayPedidosCargados, err => {
      console.log(err ? err : 'Pedidos cargados guardadas en localforage')
      mostrarPedidosCargados()
    });
    localforage.setItem('pedidosFinalizados', arrayPedidosFinalizados, err => {
      console.log(err ? err : 'Pedidos finalizados guardadas en localforage')
      mostrarPedidosFinalizados()
    });
    localforage.setItem('pedidosPadre', pedidosPadre, err => {
      console.log(err ? err : 'Pedidos padre guardados en localforage')
    });

    /* mostrarPedidosEnProceso();
    mostrarPedidosVerificados();
    mostrarPedidosCargados();
    mostrarPedidosFinalizados(); */
  });
});

let agenteAsignado = "";

function logout() {
  auth.signOut();
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

haySesion();

/* function guardarDatosPedido(idPedido) {
  db.ref(`pedidoEntrada/${idPedido}`).on('value', (pedido) => {
    let datos = pedido.val();
    localStorage.setItem('datosPedido', JSON.stringify(datos));
    $(location).attr("href", `pedido.html?id=${idPedido}`);
  });
} */

function mostrarPedidos() {
  //let pedidos = JSON.parse(localStorage.getItem('pedidos'));

  localforage.getItem('pedidos', (err, value) => {
    console.log('Obteniendo pedidos de localforage');
    let pedidos = value;

    $('#loaderPedidos').remove();
    $('#tablaPedidos').removeClass('d-none');

    let datatable = $('#tablaPedidos').DataTable({
      data: pedidos,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      columns: [
        { data: 'id' },
        { data: 'encabezado.clave', className: 'text-center' },
        { data: 'encabezado.numOrden' },
        {
          data: 'encabezado.fechaCaptura',
          render: (fechaCaptura) => {
            moment.locale('es');
            return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
          }
        },
        { data: 'encabezado.tienda' },
        { data: 'encabezado.ruta', className: 'text-center' },
        { data: null, className: 'text-center',
          defaultContent: '',
          render: (data) => {
            if(data.encabezado.pedidoBajo === true ) {
              if(data.encabezado.estandarVenta != undefined) {
                let texto = `${data.encabezado.totalKilos}/${data.encabezado.estandarVenta}`;
                return `<a class="btn btn-rojo btn-sm">${texto}</i></a>`
              }else {
                return `<a class="btn btn-rojo btn-sm">Pedido bajo <i class="fas fa-exclamation-circle"></i></a>`
              }
            }
            else if(data.encabezado.pedidoBajo === false) {
              if(data.encabezado.estandarVenta != undefined) {
                let texto = `${data.encabezado.totalKilos}/${data.encabezado.estandarVenta}`;
                return `<a class="btn btn-verde btn-sm">${texto}</i></a>`
              } else {
                return `<a class="btn btn-verde btn-sm">Pedido ok <i class="fas fa-check-circle"></i></a>`
              }
            }
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => { 
            return `<a href="pedido.html?id=${id}" class="btn btn-info btn-sm" role="button"><span class="fas fa-eye"></span> Ver más</a>`
          } 
        },
        { className: 'text-center', defaultContent: '<span style="background-color:#d50000; color:#FFFFFF;" class="badge badge-pill">Pendiente</span>'},
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<button type="button" class="btn btn-danger btn-sm" onclick="abrirModalEliminarPedido('${id}')"><i class="fas fa-trash-alt" aria-d-none="true"></i></button>`
          }
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
  });
}

/* Vue.component('tablaPedidos', {
  template: `
  <table>
                        <thead>
                            <tr>
                              <th>Id</th>
                              <th>Clave</th>
                              <th>Núm. de orden</th>
                              <th>Fecha de captura</th>
                              <th>Tienda</th>
                              <th>Ruta</th>
                              <th class="text-center">Detalles</th>
                              <th class="text-center">Estado</th>
                              <th class="text-center">Eliminar</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="pedido in pedidos">
                              <td>{{  }}</td>
                              <td>{{ pedido.clave }}</td>
                              <td>{{ pedido.numOrden }}</td>
                              <td>{{ pedido.fechaCaptura }}</td>
                              <td>{{ pedido.tienda }}</td>
                              <td>{{ pedido.ruta }}</td>
                              <td><button class="btn btn-sm btn-info">Ver más</button></td>
                              <td><button class="btn btn-sm btn-warning">Editar</button></td>
                              <td><button class="btn btn-sm btn-danger">Eliminar</button></td>
                            </tr>
                          </tbody>
                    </table>
  `,
  beforeCreate() {
    db.ref('pedidosEntrada').on('value', (snapshot) => {
      this.pedidos = snapshot.val();
    });
  }
}) */

/* const vm = new Vue({
  el: ".app"
}); */

/*Vue.use(VueFire)

new Vue({
  el: '#app',
  data: {
    region: ''
   uid: auth.currentUser.uid,
    region: "",
  },
  firebase: {
    regiones: db.ref('regiones'),
    usuario: db.ref(`usuarios/tiendas/supervisoras/${auth.currentUser.uid}`)  
  },
  computed: {
    regionesSelect() {
      
    }
  },
  beforeCreate() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        db.ref(`usuarios/tiendas/supervisoras/${user.uid}`).once('value', (snapshot) => {
          this.region = snapshot.val().regiones[0];
        });
      } 
    });
  },
  created() {
    
  },
  methods: {
    
  }
}) */

/* $('#pedidosEnProcesoTab').on('shown.bs.tab', function (e) {
  mostrarPedidosEnProceso();
}) */

function abrirModalEliminarPedido(idPedido) {
  $('#modalConfirmarEliminarPedido').modal('show');
  $('#btnConfirmar').attr('onclick', `eliminarPedido("${idPedido}")`);
}

function eliminarPedido(idPedido) {
  db.ref('pedidoEntrada').child(idPedido).remove();
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: `El pedido ${idPedido} fue eliminado con exito` });
}

function abrirModalEliminarOrden(idOrden) {
  $('#modalConfirmarEliminarOrden').modal('show');
  $('#btnConfirmarOrden').attr('onclick', `eliminarOrden("${idOrden}")`);
}

function eliminarOrden(idOrden) {
  db.ref('ordenesCompra').child(idOrden).remove();
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: `La orden ${idOrden} fue eliminada con exito` });
}

function mostrarHistorialPedidos() {
  //let pedidos = JSON.parse(localStorage.getItem('historialPedidos'));
  localforage.getItem('historialPedidos', (err, value) => {
    console.log('Obteniendo historial de pedidos de localforage');
    let pedidos = value;

    $('#loaderPedidos').remove();
    
    if(pedidos.length > 0) {
      let datatable = $('#tablaHistorialPedidos').DataTable({
        data: pedidos,
        pageLength: 10,
        columns: [
          { data: 'id' },
          { data: 'encabezado.clave' },
          { data: 'encabezado.numOrden' },
          {
            data: 'encabezado.fechaCaptura',
            render: (fechaCaptura) => {
              moment.locale('es');
              return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
            }
          },
          { data: 'encabezado.tienda' },
          { data: 'encabezado.ruta', className: 'text-center' },
          { data: 'encabezado.pedidoBajo', className: 'text-center',
            defaultContent: '',
            render: (pedidoBajo) => {
              if(pedidoBajo === true ) {
                return `<a class="btn btn-rojo btn-sm">Pedido bajo <i class="fas fa-exclamation-circle"></i></a>`
              }
              else if(pedidoBajo === false) {
                return `<a class="btn btn-verde btn-sm">Pedido ok <i class="fas fa-check-circle"></i></a>`
              }
            }
          },
          { data: 'id', 
            className: 'text-center', 
            render: (id) => { 
              return `<a href="pedidoHistorial.html?id=${id}" class="btn btn-info btn-sm"><span class="fas fa-eye"></span> Ver más</a>`
            } 
          }
        ],
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    }
    else {
      let datatable = $('#tablaHistorialPedidos').DataTable({
        pageLength: 10,
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    }
  });
}

function guardarFechaRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref(`pedidoPadre/${idPedidoPadre}`);
  let nuevaFechaRuta = $(`#fechaRuta-${idPedidoPadre}`).val();
  pedidoPadreRef.update({
    fechaRuta: nuevaFechaRuta
  });
}

function guardarRuta(idPedidoPadre) {
  let pedidoPadreRef = db.ref(`pedidoPadre/${idPedidoPadre}`);
  let nuevaRuta = $(`#ruta-${idPedidoPadre}`).val();

  pedidoPadreRef.update({
    ruta: nuevaRuta
  });
}

function mostrarPedidosEnProceso() {
  localforage.getItem('pedidosEnProceso', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidos = value;

    //$('#loaderPedidosEnProceso').removeClass('d-none');

    let datatable = $('#tablaPedidosEnProceso').DataTable({
      data: pedidos,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3, 2)}/${fechaCreacionPadre.substr(0, 2)}/${fechaCreacionPadre.substr(6, 4)}`).format('LL')
          }
        },
        {
          data: 'fechaRuta',
          render: (fechaRuta) => {
            moment.locale('es');
            if (fechaRuta.length > 0) {
              return moment(`${fechaRuta.substr(3, 2)}/${fechaRuta.substr(0, 2)}/${fechaRuta.substr(6, 4)}`).format('LL');
            }
            else {
              return "Fecha pendiente";
            }
          }
        },
        {
          data: 'ruta',
          render: (ruta) => {
            if (ruta.length > 0) {
              return ruta;
            } else {
              return "Ruta pendiente";
            }
          }
        },
        {
          data: 'agente',
          className: 'text-center',
          render: (agente) => {
            if (typeof agente != "undefined") {
              return `<div class="radioBtn btn-group"><a class="btn btn-sm btn-agente">${agente}</a></div>`;
            }
            else {
              return "";
            }
          }
        },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<button onclick="abrirModalModificarRuta('${id}')" class="btn btn-warning btn-sm"><i class="far fa-edit" aria-d-none="true"></i></button>`
          }
        },
        {
          data: 'estado',
          className: 'text-center',
          render: (estado) => {
            return `<span style="background-color:#FFCC25; color:#000000;" class="badge badge-pill">${estado}</span>`
          }
        },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<a class="btn btn-info btn-sm" role="button" href="pedidoPadre.html?id=${id}"><span class="fas fa-eye"></span> Ver más</a>`
          }
        },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<button onclick="abrirModalSeparar('${id}')" class="btn btn-danger btn-sm"><i class="fas fa-arrows-alt-h" aria-d-none="true"></i></button>`
          }
        },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<button onclick="verificarPedidoPadre('${id}')" class="btn btn-primary btn-sm"><span class="far fa-list-alt" aria-d-none="true"></span></button>`
          }
        },
        /* { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<button class="btn btn-success btn-sm" onclick="abrirModalFinalizarPedidoPadre('${id}')"><i class="fa fa-check" aria-d-none="true"></i></button>` 
          }
        } */
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    $('#loaderPedidosEnProceso').addClass('d-none');
                  
    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}
  
  /* if (pedidosPadre == null || pedidosPadre == undefined) {
    loader.remove();
    $('#pPedidosProceso').html('No se encontraron pedidos en proceso');
  } */

  

    /* $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove(); */
    // $('#tablaPedidosEnProceso').removeClass('d-none');
    /* tabla.rows.add($(filas)).columns.adjust().draw(); */

  

function mostrarPedidosVerificados() {
  localforage.getItem('pedidosVerificados', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidos = value;
  
    //$('#loaderPedidosVerificados');

    let datatable = $('#tablaPedidosEnProcesoVerificados').DataTable({
      data: pedidos,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3,2)}/${fechaCreacionPadre.substr(0,2)}/${fechaCreacionPadre.substr(6,4)}`).format('LL')
          }
        },
        {
          data: 'fechaRuta',
          render: (fechaRuta) => {
            moment.locale('es');
            if(fechaRuta.length > 0) {
              return moment(`${fechaRuta.substr(3,2)}/${fechaRuta.substr(0,2)}/${fechaRuta.substr(6,4)}`).format('LL');
            }
            else {
              return "Fecha pendiente";
            }
          }
        },
        { data: 'ruta',
          render: (ruta) => {
            if(ruta.length > 0) {
              return ruta;
            }else {
              return "Ruta pendiente";
            }
          }
        },
        { data: 'agente',
          defaultContent: "",
          className: 'text-center',
          render: (agente) => {
            if(typeof agente != "undefined") {
              return `<a class="btn btn-sm btn-agente">${agente}</a>`;   
            }
            else {
              return "";
            }
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => {
            return `<button onclick="abrirModalModificarRuta('${id}')" class="btn btn-warning btn-sm"><i class="fas fa-pencil-alt" aria-d-none="true"></i></button>` 
          }
        },
        { data: 'estado',
          className: 'text-center',
          render: (estado) => {
            return `<span style="background-color:#FFCC25; color:#000000;" class="badge badge-pill">${estado}</span>` 
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<a class="btn btn-info btn-sm" href="pedidoPadre.html?id=${id}"><span class="fas fa-eye"></span> Ver más</a>`
          }
        },
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
    /* $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove(); */
    // $('#tablaPedidosEnProceso').removeClass('d-none');
    /* tabla.rows.add($(filas)).columns.adjust().draw(); */

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

function mostrarPedidosCargados() {
  localforage.getItem('pedidosCargados', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidos = value;
    
    //$('#loaderPedidosCargados');

    let datatable = $('#tablaPedidosEnProcesoCargados').DataTable({
      data: pedidos,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3,2)}/${fechaCreacionPadre.substr(0,2)}/${fechaCreacionPadre.substr(6,4)}`).format('LL')
          }
        },
        {
          data: 'fechaRuta',
          render: (fechaRuta) => {
            moment.locale('es');
            if(fechaRuta.length > 0) {
              return moment(`${fechaRuta.substr(3,2)}/${fechaRuta.substr(0,2)}/${fechaRuta.substr(6,4)}`).format('LL');
            }
            else {
              return "Fecha pendiente";
            }
          }
        },
        { data: 'ruta',
          render: (ruta) => {
            if(ruta.length > 0) {
              return ruta;
            }else {
              return "Ruta pendiente";
            }
          }
        },
        { data: 'agente',
        className: 'text-center',
          render: (agente) => {
            if(typeof agente != "undefined") {
              return `<div class="radioBtn btn-group"><a class="btn btn-sm btn-agente">${agente}</a></div>`;   
            }
            else {
              return "";
            }
          }
        },
        { data: 'id', 
          className: 'text-center', 
          render: (id) => {
            return `<button onclick="abrirModalModificarRuta('${id}')" class="btn btn-warning btn-sm"><i class="fas fa-pencil-alt" aria-d-none="true"></i></button>` 
          }
        },
        { data: 'estado',
          className: 'text-center',
          render: (estado) => {
            return `<span style="background-color:#FFCC25; color:#000000;" class="badge badge-pill">${estado}</span>` 
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<a class="btn btn-info btn-sm" href="pedidoPadre.html?id=${id}"><span class="fas fa-eye"></span> Ver más</a>`
          }
        },
        { data: 'id',
          className: 'text-center', 
          render: (id) => {
            return `<button class="btn btn-success btn-sm" onclick="finalizarPedidoPadre('${id}')"><i class="fas fa-check" aria-d-none="true"></i></button>` 
          }
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
    /* $('#pPedidosProceso').remove();
    $('#loaderPedidosEnProceso').remove(); */
    // $('#tablaPedidosEnProceso').removeClass('d-none');
    /* tabla.rows.add($(filas)).columns.adjust().draw(); */

    $('.input-group.date').datepicker({
      autoclose: true,
      format: "dd/mm/yyyy",
      startDate: "today",
      language: "es"
    });
  });
}

$('#linkEnProceso').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#linkVerificados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#linkCargados').on('shown.bs.tab', function (e) {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

dragula([document.getElementById('tbodyTablaPedidoSeparar'), document.getElementById('tbodyTablaPedidoSeparado')]);

function abrirModalSeparar(idPedidoPadre) {
  let datatable = $('#tablaPedidoSeparar').DataTable({
    destroy: true,
    scrollY: "200px",
    ordering: false,
    paging: false,
    info: false,
    // responsive: true,
    searching: false,
    language: LANGUAGE
  });

  let rutaPedidoPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidoPadre.on('value', function (snapshot) {
    let pedidosHijos = snapshot.val().pedidosHijos;

    let filas = "";
    datatable.clear();
    for (let pedido in pedidosHijos) {
      filas += `<tr>
                  <td>${pedido}</td>
                  <td>${pedidosHijos[pedido].encabezado.numOrden}</td>
                  <td>${pedidosHijos[pedido].encabezado.fechaCaptura}</td>
                  <td>${pedidosHijos[pedido].encabezado.tienda}</td>
                  <td>${pedidosHijos[pedido].encabezado.ruta}</td>
                </tr>`;
    }
    //$('#tablaPedidoSeparar tbody').html(filas);
    datatable.rows.add($(filas)).columns.adjust().draw();

  });

  $('#modalSeparar').modal('show');
  $('#btnSeparar').attr('onclick', `separar('${idPedidoPadre}')`);
}

$('#modalSeparar').on('shown.bs.modal', function () {
  $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
});

function separar(idPedidoPadre) {
  var pedidos = [], claves = [], datosNuevoPedidoPadre, pedidosHijos = {},
    productosRepetidos = [], productosNoRepetidos = [];
  let rutaPedidoPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);

  $("#tablaPedidoSeparado tbody tr").each(function (i) {
    var clave;
    $(this).children("td").each(function (j) {
      if (j == 0) {
        if ($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);

          let pedidoEntradaRef = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos/${clave}/`);
          pedidoEntradaRef.once('value', function (snapshot) {
            let pedidoHijo = snapshot.val();
            pedidosHijos[clave] = pedidoHijo;
          });
        }
      }
    });

    if ($(this).attr('id') != "filavacia") {
      let pedidoRef = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos/${clave}`);
      pedidoRef.once('value', function (snapshot) {
        let pedido = snapshot.val();
        pedidos.push(pedido);

        let detalle = pedido.detalle;
        for (let producto in detalle) {
          let datosProducto = {
            claveConsorcio: detalle[producto].claveConsorcio,
            clave: detalle[producto].clave,
            precioUnitario: detalle[producto].precioUnitario,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            degusKg: detalle[producto].degusKg,
            pedidoPz: detalle[producto].pedidoPz,
            pedidoKg: detalle[producto].pedidoKg,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz,
            unidad: detalle[producto].unidad,
            cambioFisicoPz: detalle[producto].cambioFisicoPz,
            cambioFisicoKg: detalle[producto].cambioFisicoKg
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for (let i in productosRepetidos) {
    if (productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    }
    else {
      let bandera = false;
      for (let j in productosNoRepetidos) {

        if (productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          let productoNoRepetido = productosNoRepetidos[j];
          let productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if (bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }

  let pedidosPadreRef = db.ref('pedidoPadre/');
  pedidosPadreRef.once('value', function (snapshot) {
    let existe = (snapshot.val() != null);
    if (existe) {
      let listapedidos = snapshot.val(),
        keys = Object.keys(listapedidos),
        last = keys[keys.length - 1],
        ultimoPedido = listapedidos[last],
        lastclave = ultimoPedido.clave,
        fechaCreacionPadre = moment().format('DD/MM/YYYY'),
        datosPedidoPadre = {
          // agente: "",
          fechaCreacionPadre: fechaCreacionPadre,
          fechaRuta: "",
          verificado: false,
          ruta: "",
          productos: productosNoRepetidos,
          clave: lastclave + 1,
          estado: "En proceso",
          pedidosHijos: pedidosHijos
        };

      pedidosPadreRef.push(datosPedidoPadre);

      for (let clave in claves) {
        let rutaPedidosHijos = db.ref(`pedidoPadre/${idPedidoPadre}/pedidosHijos`);
        rutaPedidosHijos.child(claves[clave]).remove();
      }
      limpiarTablaSeparado();

      rutaPedidoPadre.once('value', function (snapshot) {
        let pedidosHijos = snapshot.val().pedidosHijos;

        if (pedidosHijos == null) {
          let rutaPedidosPadre = db.ref('pedidoPadre');
          rutaPedidosPadre.child(idPedidoPadre).remove();
          $('#modalSeparar').modal('hide');
        }
      });
    }
  });
}

function limpiarTablaSeparado() {
  let row = `<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>`;

  $('#tbodyTablaPedidoSeparado').html(row);
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: `Se ha separado el pedido` });
}

function mostrarPedidosFinalizados() {
  localforage.getItem('pedidosFinalizados', (err, value) => {
    console.log('Obteniendo pedidos en proceso de localforage');
    let pedidos = value;
      
    let datatable = $('#tablaPedidosFinalizados').DataTable({
      data: pedidos,
      pageLength: 10,
      columns: [
        { data: 'clave' },
        {
          data: 'fechaCreacionPadre',
          render: (fechaCreacionPadre) => {
            moment.locale('es');
            return moment(`${fechaCreacionPadre.substr(3, 2)}/${fechaCreacionPadre.substr(0, 2)}/${fechaCreacionPadre.substr(6, 4)}`).format('LL')
          }
        },
        {
          data: 'fechaRuta',
          render: (fechaRuta) => {
            moment.locale('es');
            if (fechaRuta.length > 0) {
              return moment(`${fechaRuta.substr(3, 2)}/${fechaRuta.substr(0, 2)}/${fechaRuta.substr(6, 4)}`).format('LL');
            }
            else {
              return "Fecha pendiente";
            }
          }
        },
        {
          data: 'ruta',
          render: (ruta) => {
            if (ruta.length > 0) {
              return ruta;
            } else {
              return "Ruta pendiente";
            }
          }
        },
        {
          data: 'agente',
          className: 'text-center',
          render: (agente) => {
            if (typeof agente != "undefined") {
              return `<div class="radioBtn btn-group"><a class="btn btn-sm btn-agente">${agente}</a></div>`;
            }
            else {
              return "";
            }
          }
        },
        { className: 'text-center', defaultContent: '<span style="background-color:#42f486; color:#000000;" class="badge badge-pill">Finalizado</span>' },
        {
          data: 'id',
          className: 'text-center',
          render: (id) => {
            return `<a class="btn btn-info btn-sm" href="pedidoPadre.html?id=${id}"><span class="fas fa-eye"></span> Ver más</a>`
          }
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
  });
}

/* function abrirModalFinalizarPedidoPadre(idPedidoPadre) {
  $('#modalFinalizarPedidoPadre').modal('show');
  $('#btnFinalizarPedidoPadre').attr('onclick', `finalizarPedidoPadre('${idPedidoPadre}')`);
} */

function llenarSelectAgentes() {
  let rutaAgentes = db.ref(`usuarios/administrativo/ventas/agentes`);
  rutaAgentes.on('value', function (snapshot) {
    let agentes = snapshot.val();

    let options = "<option value='Seleccionar'>Seleccionar</option>";
    for (let agente in agentes) {
      options += `<option value="${agentes[agente].nombre}">${agentes[agente].nombre}</option>`;
    }

    $('#agente').html(options);
  });
}

/* function finalizarPedidoPadre(idPedidoPadre) {
  let rutaPedidoPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidoPadre.update({
    estado: "Finalizado"
  });
} */

function finalizarPedidoPadre(idPedidoPadre) {
  swal({
    title: "¿Está seguro que desea finalizar este pedido?",
    text: "Esta operación no podrá deshacerse.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      db.ref(`pedidoPadre/${idPedidoPadre}`).update({
        /* verificado: true */
        estado: "Finalizado"
      });

      swal("El pedido se ha finalizado con exito", {
        icon: "success",
      });
    }
  });
}

function verificarPedidoPadre(idPedidoPadre) {
  swal({
    title: "¿Está seguro que desea verificar este pedido?",
    text: "Esta operación no podrá deshacerse.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      db.ref(`pedidoPadre/${idPedidoPadre}`).update({
        /* verificado: true */
        estado: "Verificado"
      });

      swal("El pedido se ha verificado", {
        icon: "success",
      });
    }
  }); 
  //$.toaster({ priority: 'success', title: 'Mensaje de información', message: `Pedido verificado` });
}

function abrirModalModificarRuta(idPedidoPadre) {
  let rutaPedidosPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidosPadre.once('value', function (snapshot) {
    $('#fechaRuta').val(snapshot.val().fechaRuta);
    $('#ruta').val(snapshot.val().ruta);
    let agente = snapshot.val().agente;
    // if(agente != undefined) {
    //   let rutaAgentes = db.ref(`usuarios/administrativo/ventas/agentes/${agente}`);
    //   rutaAgentes.once('value', function(datos){
    //     $('#agenteAsignado').html(`${datos.val().nombre}`).removeClass('d-none');
    //   });
    // }

    $('#modalModificarRuta').modal('show');
    llenarSelectAgentes();
    if (agente != undefined) {
      $('#agente').val(agente);
    }
    $('#btnGuardarRuta').attr('onclick', `guardarDatos('${idPedidoPadre}')`);
  });
}

// function asignarAgente() {
//   let agente = $('#agente').val();
//   let nombreAgente = $('#agente').text();
//   if(agente != undefined && agente != null) {
//     $('#agenteAsignado').html(`<a class="btn btn-agente">${nombreAgente}</a>`);
//     agenteAsignado = agente;
//   }
// }

function guardarDatos(idPedidoPadre) {
  let fechaRuta = $('#fechaRuta').val();
  let ruta = $('#ruta').val();
  let agente = $('#agente').val();

  let rutaPedidosPadre = db.ref(`pedidoPadre/${idPedidoPadre}`);
  rutaPedidosPadre.update({
    fechaRuta: fechaRuta,
    ruta: ruta,
    // agente: agenteAsignado
    agente: agente
  });

  // agenteAsignado = "";
  $.toaster({ priority: 'success', title: 'Mensaje de información', message: `Datos guardados` });
  $('#modalModificarRuta').modal('hide');
}

dragula([document.getElementById('tbodyTablaPedidos'), document.getElementById('tbodyTablaPedidoPadre')]);
dragula([document.getElementById('tbodyTablaOrdenes'), document.getElementById('tbodyTablaPedidoPadre')]);

function tirarAlertaGenerarPedidoPadre() {
  swal({
    title: "¿Está seguro que desea agrupar estos pedidos?",
    text: "Esta operación no podrá deshacerse.",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      generarPedidoPadre();

      swal("Los pedidos se han agrupado con exito", {
        icon: "success",
      });
    }
  });
}

function generarPedidoPadre() {
  var pedidos = [], claves = [], promotoras = [];
  var productosRepetidos = [], productosNoRepetidos = [];

  $("#tablaPedidoPadre tbody tr").each(function (i) {
    var clave;
    $(this).children("td").each(function (j) {
      if (j == 0) {
        if ($(this).text().length > 0) {
          clave = $(this).text();
          claves.push(clave);

          let pedidoEntradaRef = db.ref(`pedidoEntrada/${clave}/encabezado`);
          pedidoEntradaRef.once('value', function (snapshot) {
            let promotora = snapshot.val().promotora;
            promotoras.push(promotora);
          });
        }
      }
    });

    if ($(this).attr('id') != "vacio") {
      let pedidoRef = db.ref(`pedidoEntrada/${clave}`);
      pedidoRef.once('value', function (snapshot) {
        let pedido = snapshot.val();
        pedidos.push(pedido);

        let detalle = pedido.detalle;
        for (let producto in detalle) {
          let datosProducto = {
            claveConsorcio: detalle[producto].claveConsorcio,
            clave: detalle[producto].clave,
            precioUnitario: detalle[producto].precioUnitario,
            nombre: detalle[producto].nombre,
            degusPz: detalle[producto].degusPz,
            degusKg: detalle[producto].degusKg,
            pedidoPz: detalle[producto].pedidoPz,
            pedidoKg: detalle[producto].pedidoKg,
            totalKg: detalle[producto].totalKg,
            totalPz: detalle[producto].totalPz,
            unidad: detalle[producto].unidad,
            cambioFisicoPz: detalle[producto].cambioFisicoPz,
            cambioFisicoKg: detalle[producto].cambioFisicoKg
          };

          productosRepetidos.push(datosProducto);
        }
      });
    }
  });

  for (let i in productosRepetidos) {
    if (productosNoRepetidos.length == 0) {
      productosNoRepetidos.push(productosRepetidos[i]);
    }
    else {
      let bandera = false;
      for (let j in productosNoRepetidos) {

        if (productosRepetidos[i].clave == productosNoRepetidos[j].clave) {
          bandera = true;

          let productoNoRepetido = productosNoRepetidos[j];
          let productoRepetido = productosRepetidos[i];

          productoNoRepetido.totalKg = productoNoRepetido.totalKg + productoRepetido.totalKg;
          productoNoRepetido.totalPz = productoNoRepetido.totalPz + productoRepetido.totalPz;
        }
      }
      if (bandera == false) {
        productosNoRepetidos.push(productosRepetidos[i]);
      }
    }
  }

  let pedidosPadresRef = db.ref('pedidoPadre/');
  pedidosPadresRef.once('value', function (snapshot) {
    let existe = (snapshot.val() != null);
    if (existe) {
      let listapedidos = snapshot.val(),
        keys = Object.keys(listapedidos),
        last = keys[keys.length - 1],
        ultimoPedido = listapedidos[last],
        lastclave = ultimoPedido.clave,
        fechaCreacionPadre = moment().format('DD/MM/YYYY'),
        pedidoPadreRef = db.ref('pedidoPadre/'),
        datosPedidoPadre = {
          fechaCreacionPadre: fechaCreacionPadre,
          fechaRuta: "",
          verificado: false,
          ruta: "",
          productos: productosNoRepetidos,
          clave: lastclave + 1,
          estado: "En proceso"
        };

      let key = pedidoPadreRef.push(datosPedidoPadre).getKey();
      let pedidoPadreRefKey = db.ref(`pedidoPadre/${key}/pedidosHijos`);
      //let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for (let pedido in pedidos) {
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref(`usuarios/tiendas/supervisoras/${pedidos[pedido].encabezado.promotora}`);
        promotoraRef.once('value', function (snapshot) {
          let region = snapshot.val().region;

          /*Se entra a pedidosEntrada para obtener el id de la tienda de ese pedido y mandar el pedido a historial de regiones
           *Y después removerlo de pedidosEntrada */
          let pedidoRef = db.ref(`pedidoEntrada/${claves[pedido]}`);
          pedidoRef.once('value', function (snappy) {

            // let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            // let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
            // regionRef.push(pedidos[pedido]);

            //pedidoEntradaRef.child(claves[pedido]).remove();
            pedidoEntradaRef.child(claves[pedido]).child("encabezado").update({
              agrupado: true
            }).then(function (snapshot) {


              //Las siguientes dos líneas guardan en historial los pedidos que se estan agrupando tal
              //como se guardan en pedidosEntrada ya que al grupar se borran esos pedidos de pedidosEntrada.
              let rutaHistorialPedidosEntrada = db.ref(`historialPedidosEntrada/${claves[pedido]}/`);
              rutaHistorialPedidosEntrada.set(pedidos[pedido]);
            });
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      //historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = `<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>`;
      $('#tbodyTablaPedidoPadre').html(row);
      //$.toaster({ priority: 'success', title: 'Mensaje de información', message: `Se generó el pedido padre correctamente` });

      // for(let promotora in promotoras) {
      //   let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
      //   moment.locale('es');
      //   let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
      //   let fecha = formato.toString();
      //   let notificacion = {
      //     fecha: fecha,
      //     leida: false,
      //     mensaje: `El pedido: ${claves[promotora]} se ha agrupado.`
      //   }

      //   notificacionesListaRef.push(notificacion);

      //   let notificacionesRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}`);
      //   notificacionesRef.once('value', function(snapshot) {
      //     let notusuario = snapshot.val();
      //     let cont = notusuario.cont + 1;

      //     notificacionesRef.update({cont: cont});
      //   });
      // }
      enviarNotificacion(promotoras, claves);
    }
    else {
      let fechaCreacionPadre = moment().format('DD/MM/YYYY');
      let pedidoPadreRef = db.ref('pedidoPadre/');
      let datosPedidoPadre = {
        fechaCreacionPadre: fechaCreacionPadre,
        fechaRuta: "",
        ruta: "",
        verificado: false,
        productos: productosNoRepetidos,
        clave: 1,
        estado: "En proceso"
      }
      let key = pedidoPadreRef.push(datosPedidoPadre).getKey();

      let pedidoPadreRefKey = db.ref(`pedidoPadre/${key}/pedidosHijos`);
      // let historialPedidosEntradaRef = db.ref('historialPedidosEntrada');
      let pedidoEntradaRef = db.ref('pedidoEntrada');

      let datosPedidosHijos = {};
      for (let pedido in pedidos) {
        datosPedidosHijos[claves[pedido]] = pedidos[pedido];

        let promotoraRef = db.ref(`usuarios/tiendas/supervisoras/${pedidos[pedido].encabezado.promotora}`);
        promotoraRef.once('value', function (snapshot) {
          let region = snapshot.val().region;

          /*Se entra a pedidosEntrada para obtener el id de la tienda de ese pedido y mandar el pedido a historial de regiones
           *Y después removerlo de pedidosEntrada */
          let pedidoRef = db.ref(`pedidoEntrada/${claves[pedido]}`);
          pedidoRef.once('value', function (snappy) {
            // let idTienda = snappy.val().encabezado.tienda.split(" ")[0];
            // let regionRef = db.ref(`regiones/${region}/${idTienda}/historialPedidos`);
            // regionRef.push(pedidos[pedido]);

            pedidoEntradaRef.child(claves[pedido]).child("encabezado").update({
              agrupado: true
            }).then(function () {
              //Las siguientes dos líneas guardan en historial los pedidos que se estan agrupando tal
              //como se guardan en pedidosEntrada ya que al grupar se borran esos pedidos de pedidosEntrada.
              let rutaHistorialPedidosEntrada = db.ref(`historialPedidosEntrada/${claves[pedido]}/`);
              rutaHistorialPedidosEntrada.set(pedidos[pedido]);
            });
          });
        });
      }

      pedidoPadreRefKey.set(datosPedidosHijos);
      // historialPedidosEntradaRef.push(datosPedidosHijos);

      let row = `<tr id="vacio" style="padding:0px 0px 0px;" class="no-pading">
                  <td scope="row" style="border:none;"></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="no-padding"></td>
                  <td class="no-padding"> </td>
                </tr>`;
      $('#tbodyTablaPedidoPadre').html(row);

      //$.toaster({ priority: 'success', title: 'Mensaje de información', message: `Se generó el pedido padre correctamente` });

      // for(let promotora in promotoras) {
      //   let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
      //   moment.locale('es');
      //   let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
      //   let fecha = formato.toString();
      //   let notificacion = {
      //     fecha: fecha,
      //     leida: false,
      //     mensaje: "El pedido: " + claves[promotora] + " se ha agrupado."
      //   }

      //   notificacionesListaRef.push(notificacion);

      //   let notificacionesRef = db.ref('notificaciones/tiendas/'+promotoras[promotora]);
      //   notificacionesRef.once('value', function(snapshot) {
      //     let notusuario = snapshot.val();
      //     let cont = notusuario.cont + 1;

      //     notificacionesRef.update({cont: cont});
      //   });
      // }
      enviarNotificacion(promotoras, claves);
    }
  });
}

function enviarNotificacion(promotoras, claves) {
  for (let promotora in promotoras) {
    let notificacionesListaRef = db.ref(`notificaciones/tiendas/${promotoras[promotora]}/lista`);
    moment.locale('es');
    let formato = moment().format("MMMM DD YYYY, HH:mm:ss");
    let fecha = formato.toString();
    let notificacion = {
      fecha: fecha,
      leida: false,
      mensaje: "El pedido: " + claves[promotora] + " se ha agrupado."
    }

    notificacionesListaRef.push(notificacion);

    let notificacionesRef = db.ref('notificaciones/tiendas/' + promotoras[promotora]);
    notificacionesRef.once('value', function (snapshot) {
      let notusuario = snapshot.val();
      let cont = notusuario.cont + 1;

      notificacionesRef.update({ cont: cont });
    });
  }
}

function cancelarPedidoPadre() {
  $('#tablaPedidoPadre tbody').empty()
    .append(`<tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>`);
  mostrarPedidos();
}

function pedidosRecibidos() {
  $('#pedidosEnProceso').hide();
  $('#pedidosFinalizados').hide();
  $('#historialPedidos').hide();
  $('#pedidosRecibidos').show();

  mostrarPedidos();
}

function pedidosEnProceso()  {
  $('#pedidosRecibidos').hide();
  $('#historialPedidos').hide();
  $('#pedidosFinalizados').hide();
  $('#pedidosEnProceso').show();

  mostrarPedidosEnProceso();
}

function historialPedidos() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#pedidosFinalizados').hide();
  $('#historialPedidos').show();

  mostrarHistorialPedidos();
}

function pedidosFinalizados() {
  $('#pedidosRecibidos').hide();
  $('#pedidosEnProceso').hide();
  $('#historialPedidos').hide();
  $('#pedidosFinalizados').show();

  mostrarPedidosFinalizados();
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
  notificacionesRef.on('value', function (snapshot) {
    let lista = snapshot.val();
    let lis = '<h6 class="dropdown-header">Notificaciones</h6><div class="dropdown-divider"></div>';

    let arrayNotificaciones = [];
    for (let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for (let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += `<a class="dropdown-item" href="#">
                <div>
                  <i class="fas fa-comment"></i>${arrayNotificaciones[i].mensaje}
                  <span class="float-sm-right text-muted small">${fecha}</span>
                </div>
              </a>`;

      /* lis += `<li>
                <a>
                  <div>
                    <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                    <span class="pull-right text-muted small">${fecha}</span>
                  </div>
                </a>
              </li>`; */
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
