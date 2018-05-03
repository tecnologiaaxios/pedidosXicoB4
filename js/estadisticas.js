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

  $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  llenarSelectZonas();
  llenarSelectClaves();
  mostrarTodosPedidos();
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

$('#filtro').change(function() {
  let filtro = $(this).val();

  if(filtro === "Todos") {
    $('#zona').attr('readonly', true);
    $('#fechaInicio').attr('readonly', true);
    $('#fechaFin').attr('readonly', true);
    $('#btnBuscar').attr('disabled', true);
    limpiarCampos();

    mostrarTodosPedidos();
  }
  else {
    $('#zona').attr('readonly', false);
    $('#fechaInicio').attr('readonly', false);
    $('#fechaFin').attr('readonly', false);
    $('#btnBuscar').attr('disabled', false);
  }
});

let filtrarPedidos = () => {
  let zona = $('#zona').val();
  let fechaInicio = $('#fechaInicio').val();
  let fechaFin = $('#fechaFin').val();
  let kgTotales = 0;
  let pzTotales = 0;

  let desde = fechaInicio.split('-');
  let hasta = fechaFin.split('-');

  let fechaDesde = new Date(`${desde[1]}/${desde[2]}/${desde[0]}`);
  let fechaHasta = new Date(`${hasta[1]}/${hasta[2]}/${hasta[0]}`);

  //$('#pedidos').DataTable().destroy();
  let datatable = $('#pedidos').DataTable({
    scrollY: "400px",
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });
  datatable.clear().draw();
  $('#kgTotales').html(`${kgTotales}`);
  $('#pzTotales').html(`${pzTotales}`);

  $('#loaderPedidos').removeClass('d-none');
  if(zona && fechaInicio && fechaFin) {
    db.ref('pedidoEntrada').once('value', snapshot => {
      let pedidos = snapshot.val();
      let filas = "";

      /* let datatable = $('#pedidos').DataTable({
        scrollY: "400px",
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
      datatable.clear(); */

      for(let pedido in pedidos) {
        let encabezado = pedidos[pedido].encabezado;
        if(encabezado.agrupado) {
          let fechaPedido = encabezado.fechaCaptura;
          let date = fechaPedido.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if(encabezado.ruta === zona && (fechaCaptura >= fechaDesde && fechaCaptura <= fechaHasta)) {
            let numOrden = encabezado.numOrden || "";
            let totalKilos = encabezado.totalKilos || "";
            let totalPiezas = encabezado.totalPiezas || "";
            moment.locale('es');
            let fechaMostrar = moment(`${date[1]}/${date[0]}/${date[2]}`).format('LL')
            kgTotales += Number(totalKilos);
            pzTotales += Number(totalPiezas);

            filas += `<tr>
                        <td class="text-center">${encabezado.clave}</td>
                        <td class="text-center">${numOrden}</td>
                        <td class="text-center">${fechaMostrar}</td>
                        <td>${encabezado.tienda}</td>
                        <td>${encabezado.ruta}</td>
                        <td>${totalKilos}</td>
                        <td>${totalPiezas}</td>
                      </tr>`;
          }
        }
      }
      $('#kgTotales').html(`${kgTotales.toFixed(4)}`);
      $('#pzTotales').html(`${pzTotales.toFixed(4)}`);
      //$('#pedidos tbody').html(filas);
      datatable.rows.add($(filas)).columns.adjust().draw();
      $('#loaderPedidos').addClass('d-none');
    });
  }
  if(zona && (fechaInicio.length == 0) && (fechaFin.length == 0)) {
    db.ref('pedidoEntrada').once('value', snapshot => {
      let pedidos = snapshot.val();
      let filas = "";

      /* let datatable = $('#pedidos').DataTable({
        scrollY: "400px",
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
       datatable.clear(); */

      for(let pedido in pedidos) {
        let encabezado = pedidos[pedido].encabezado;
        if(encabezado.agrupado && zona === encabezado.ruta) {
          let fechaPedido = encabezado.fechaCaptura;
          let date = fechaPedido.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          let numOrden = encabezado.numOrden || "";
          let totalKilos = encabezado.totalKilos || "";
          let totalPiezas = encabezado.totalPiezas || "";
          kgTotales += Number(totalKilos);
          pzTotales += Number(totalPiezas);

          filas += `<tr>
                      <td class="text-center">${encabezado.clave}</td>
                      <td class="text-center">${numOrden}</td>
                      <td class="text-center">${encabezado.fechaCaptura}</td>
                      <td>${encabezado.tienda}</td>
                      <td>${encabezado.ruta}</td>
                      <td>${totalKilos}</td>
                      <td>${totalPiezas}</td>
                    </tr>`;
        }  
      }
      $('#kgTotales').html(`${kgTotales.toFixed(4)}`);
      $('#pzTotales').html(`${pzTotales.toFixed(4)}`);
      //$('#pedidos tbody').html(filas);
      datatable.rows.add($(filas)).columns.adjust().draw();
      $('#loaderPedidos').addClass('d-none');
    });
  }
  if((zona === null) && fechaInicio && fechaFin) {
    db.ref('pedidoEntrada').once('value', snapshot => {
      let pedidos = snapshot.val();
      let filas = "";

      /* let datatable = $('#pedidos').DataTable({
        scrollY: "400px",
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
       datatable.clear(); */

      for(let pedido in pedidos) {
        let encabezado = pedidos[pedido].encabezado;
        if(encabezado.agrupado) {
          let fechaPedido = encabezado.fechaCaptura;
          let date = fechaPedido.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if((fechaCaptura >= fechaDesde) && (fechaCaptura <= fechaHasta)) {
            let numOrden = encabezado.numOrden || "";
            let totalKilos = encabezado.totalKilos || "";
            let totalPiezas = encabezado.totalPiezas || "";
            kgTotales += Number(totalKilos);
            pzTotales += Number(totalPiezas);

            filas += `<tr>
                        <td class="text-center">${encabezado.clave}</td>
                        <td class="text-center">${numOrden}</td>
                        <td class="text-center">${encabezado.fechaCaptura}</td>
                        <td>${encabezado.tienda}</td>
                        <td>${encabezado.ruta}</td>
                        <td>${totalKilos}</td>
                        <td>${totalPiezas}</td>
                      </tr>`;
          }
        }
      }
      $('#kgTotales').html(`${kgTotales.toFixed(4)}`);
      $('#pzTotales').html(`${pzTotales.toFixed(4)}`);
      //$('#pedidos tbody').html(filas);
      datatable.rows.add($(filas)).columns.adjust().draw();
      $('#loaderPedidos').addClass('d-none');
    });
  }
}

let mostrarTodosPedidos = () => {
  $('#loaderPedidos').removeClass('d-none');

  /* $('#pedidos').DataTable().clear().destroy(); */

  db.ref('pedidoEntrada').once('value', snapshot => {
    let pedidos = snapshot.val();
    let kgTotales = 0;
    let pzTotales = 0;
    let arrPedidos = [];
    snapshot.forEach(pedido => {
      arrPedidos.push(pedido.val());
    });

    let datatable = $('#pedidos').DataTable({
      data: arrPedidos,
      scrollY: "400px",
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      columns: [
        { data: 'encabezado.clave', className: 'text-center' },
        { data: 'encabezado.numOrden', defaultContent: "" },
        {
          data: 'encabezado.fechaCaptura',
          render: (fechaCaptura) => {
            moment.locale('es');
            return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
          }
        },
        { data: 'encabezado.tienda' },
        { data: 'encabezado.ruta', className: 'text-center' },
        { 
          data: 'encabezado.totalKilos',
          render: (totalKilos) => {
            kgTotales += Number(totalKilos);
            return totalKilos;
          },
          className: 'text-center', 
          defaultContent: ""},
        { 
          data: 'encabezado.totalPiezas',
          render: (totalPiezas) => {
            pzTotales += Number(totalPiezas);
            return totalPiezas;
          },
          className: 'text-center',
          defaultContent: ""
        }
      ],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    $('#kgTotales').html(`${kgTotales.toFixed(4)}`);
    $('#pzTotales').html(`${pzTotales.toFixed(4)}`);

    $('#loaderPedidos').addClass('d-none');
  });
}

let limpiarCampos = () => {
  $('#fechaInicio').val('');
  $('#fechaFin').val('');
}

function llenarSelectZonas() {
  db.ref('regiones').once('value', regiones => {
    let zonas = regiones.val();

    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (let zona in zonas) {
      options += `<option value="${zona}">${zona}</option>`;
    }

    $('#zona').html(options);
    $('#zonaProducto').html(options);
  });
}

function llenarSelectClaves() {
  db.ref('listadoProductos').once('value', snapshot => {
    let productos = snapshot.val();
    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for(let producto in productos) {
      options += `<option value="${producto}">${producto}</option>`;
    }

    $('#claves').html(options);
  })
}

let filtrarProductos = () => {
  let clave = $('#clave').val();
  let zona = $('#zona').val();
  let fecha = $('#fecha').val();
  let ref = db.ref('estadisticasProductos');
  let datatable = $('#productos').DataTable({
    scrollY: "400px",
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  datatable.clear();
  
  if(clave && zona && fecha) {
    ref.orderByChild('clave').equalTo(clave).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        if(producto.zona === zona && producto.fecha === fecha) {
          filas += `<tr>
                      <td>${producto.clave}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.zona}</td>
                      <td>${producto.fecha}</td>
                      <td>${producto.totalKilos}</td>
                      <td>${producto.totalPiezas}</td>
                    </tr>`;
        }
      }
    });
    datatable.rows.add($(filas)).columns.adjust().draw();
  }
  if(clave && zona && fecha.length === 0) {
    ref.orderByChild('clave').equalTo(clave).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        if(producto.zona === zona) {
          filas += `<tr>
                      <td>${producto.clave}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.zona}</td>
                      <td>${producto.fecha}</td>
                      <td>${producto.totalKilos}</td>
                      <td>${producto.totalPiezas}</td>
                    </tr>`;
        }
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
  if(clave && zona === null && fecha) {
    ref.orderByChild('clave').equalTo(clave).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        if(producto.fecha === fecha) {
          filas += `<tr>
                      <td>${producto.clave}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.zona}</td>
                      <td>${producto.fecha}</td>
                      <td>${producto.totalKilos}</td>
                      <td>${producto.totalPiezas}</td>
                    </tr>`;
        }
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
  if(clave === null & zona && fecha) {
    ref.orderByChild(zona).equalTo(zona).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        if(producto.fecha === fecha) {
          filas += `<tr>
                      <td>${producto.clave}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.zona}</td>
                      <td>${producto.fecha}</td>
                      <td>${producto.totalKilos}</td>
                      <td>${producto.totalPiezas}</td>
                    </tr>`;
        } 
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
  if(clave && zona === null && fecha.length === 0) {
    ref.orderByChild(clave).equalTo(clave).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        filas += `<tr>
                    <td>${producto.clave}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.zona}</td>
                    <td>${producto.fecha}</td>
                    <td>${producto.totalKilos}</td>
                    <td>${producto.totalPiezas}</td>
                  </tr>`;
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
  if(clave === null && zona && fecha.length === 0) {
    ref.orderByChild('zona').equalTo(zona).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        filas += `<tr>
                    <td>${producto.clave}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.zona}</td>
                    <td>${producto.fecha}</td>
                    <td>${producto.totalKilos}</td>
                    <td>${producto.totalPiezas}</td>
                  </tr>`;
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
  if(clave === null && zona === null && fecha) {
    ref.orderByChild('fecha').equalTo(fecha).once('value', snapshot => {
      let estadisiticasProductos = snapshot.val();
      let filas = "";
      for(let estadistica in estadisticasProductos) {
        let producto = estadisticasProductos[estadistica];
        filas += `<tr>
                    <td>${producto.clave}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.zona}</td>
                    <td>${producto.fecha}</td>
                    <td>${producto.totalKilos}</td>
                    <td>${producto.totalPiezas}</td>
                  </tr>`;
      }
      datatable.rows.add($(filas)).columns.adjust().draw();
    });
  }
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

/* function limpiar() {
  $('#clave').val('');
  $('#zonaProducto').val('');
  $('#fecha').val('');

  $('#tablaProductos').DataTable().destroy();
} */

/* Vue.component('tabla-pedidos', {
  template: ``,
  props: {
    pedidos: {
      type: Array
    }
  },
  data() {

  },
  updated() {
    $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
  }
}); */



/*Vue.component('todos', {
  template: `
    <table width="100%" id="pedidos" class="table table-condensed table-bordered table-striped table-hover">
      <thead>
        <tr>
          <th class="text-center">Clave</th>
          <th class="text-center">Núm. orden</th>
          <th>Fecha captura</th>
          <th>Tienda</th>
          <th>Zona</th>
          <th class="text-center">Total Kg</th>
          <th class="text-center">Total Pz</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidos">
          <td class="text-center">{{ pedido.encabezado.clave }}</td>
          <td class="text-center">{{ pedido.encabezado.numOrden || "" }}</td>
          <td>{{ pedido.encabezado.fechaCaptura }}</td>
          <td>{{ pedido.encabezado.tienda }}</td>
          <td class="text-center">{{ pedido.encabezado.ruta }}</td>
          <td class="text-center">{{ pedido.encabezado.totalKilos }}</td>
          <td class="text-center">{{ pedido.encabezado.totalPiezas }}</td>
        </tr>
      </tbody>
    </table>
  `,
  beforeCreate() {
    let pedidos = JSON.parse(localStorage.getItem('filtrarPedidos'));
    this.pedidos = pedidos;
  },
  data() {
    pedidos: []
  },
  computed: {
    fechas() {
      return(
        pedidos.map(function(pedido) {
          let fechaPedido = pedido.encabezado.fechaCaptura;
          moment.locale('es');
          return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
        })
      )
    }
  }
})*/

/*const mv = new Vue({
  el: '#app',
  data: {
    filtro: '',
    zona: 'Seleccionar',
    fechaInicio: '',
    fechaFin: '',
    desde: [],
    hasta: [],
    fechaDesde: null,
    fechaHasta: null
  },
  methods: {
     habilitar() {
      if(this.filtro === "PorZona") {
        $('#zona').attr('readonly', false);
        $('#fechaInicio').attr('readonly', false);
        $('#fechaFin').attr('readonly', false);
        $('#btnBuscar').attr('disabled', false);
      }
      if(this.filtro === "Todos") {
        this.mostrarTodos();
      }
      
    }, */
    /* mostrarTodos() {
      console.log("metodo todos")
    }, */
    /* filtrar() {
      this.desde = fechaInicio.split('-');
      this.hasta = fechaFin.split('-');

      this.fechaDesde = new Date(`${desde[1]}/${desde[2]}/${desde[0]}`);
      this.fechaHasta = new Date(`${hasta[1]}/${hasta[2]}/${hasta[0]}`);

      if(zona && fechaInicio && fechaFin) {
        let pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
        let filas = "";
        let datatable = $('#pedidos').DataTable({
          data: pedidos,
          pageLength: 25,
          lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
          destroy: true,
          ordering: false,
          language: LANGUAGE
        });

        datatable.clear();

        for(let pedido in pedidos) {
          let encabezado = pedidos[pedido].encabezado;
          let fechaPedido = encabezado.fechaCaptura;
          let date = fechaPedido.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if(encabezado.ruta === zona && (fechaCaptura >= fechaDesde && fechaCaptura <= fechaHasta)) {
            let numOrden = encabezado.numOrden || "";
            let totalKilos = encabezado.totalKilos || "";
            let totalPiezas = encabezado.totalPiezas || "";
            moment.locale('es');
            let fechaMostrar = moment(`${date[1]}/${date[0]}/${date[2]}`).format('LL')
            kgTotales += Number(totalKilos);
            pzTotales += Number(totalPiezas);

            filas += `<tr>
                        <td class="text-center">${encabezado.clave}</td>
                        <td class="text-center">${numOrden}</td>
                        <td class="text-center">${fechaMostrar}</td>
                        <td>${encabezado.tienda}</td>
                        <td>${encabezado.ruta}</td>
                        <td>${totalKilos}</td>
                        <td>${totalPiezas}</td>
                      </tr>`;
          }
        }
        $('#kgTotales').html(`Kg: ${kgTotales.toFixed(4)}`);
        $('#pzTotales').html(`Pz: ${pzTotales.toFixed(4)}`);
        //$('#pedidos tbody').html(filas);
        datatable.rows.add($(filas)).columns.adjust().draw();
      }
    } 
  }
})*/

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});