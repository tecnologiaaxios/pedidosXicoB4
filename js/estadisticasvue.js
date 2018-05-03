//  Vue.component('tabla-productos', {
  //template: '#productos2',
   /* template: `<table width="100%" id="tablaProductos" class="table table-condensed table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th class="text-center">Clave</th>
                  <th>Nombre</th>
                  <th>Zona</th>
                  <th>Fecha</th>
                  <th class="text-center">Total Kg</th>
                  <th class="text-center">Total Pz</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in listaProductos">
                  <td class="text-center">{{ producto.clave }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.zona }}</td>
                  <td>{{ producto.fecha }}</td>
                  <td class="text-center">{{ producto.totalKilos }}</td>
                  <td class="text-center">{{ producto.totalPiezas }}</td>
                </tr>
              </tbody>
            </table>
  `,
  props: {
    productos: {
      type: Array
    }
  },
  data() {
    return { */
      //listaProductos: this.productos
    /* }
  },
  computed: {
    listaProductos() {
      return this.productos
    }
  },
  mounted() {  */
    /* $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    }); */
  /* },
  updated() {
    $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
    
  }
}) */
Vue.use(VueFire)

new Vue({
  el: '#appProductos',
  data: {
    /* filtro: '',
    zonaPedidos: '',
    fechaInicio: '',
    fechaFin: '',
    pedidos: [],
    peidosFiltrados: [], */

    productos: [],
    productosFiltrados: [],
    listaKilos: [],
    listaPiezas: [],
    clave: 'Seleccionar',
    zona: 'Seleccionar',
    fechaInicioProductos: '',
    fechaFinProductos: '',
    fechaFiltro: '',
    fechaFiltro2: '',
    totalKg: 0,
    totalPz: 0,
  },
  /* firebase: {
    vueProductos: db.ref('estadisticasProductos')  
  }, */
  computed: {
    kilosProducto() {
      /* this.productos.map((producto) => {
        if(producto.fecha )
      }); */
    },
    piezasProducto() {

    },
    strTotalKg() {
      return `Total Kg: ${this.totalKg}`
    },
    strTotalPz() {
      return `Total Pz: ${this.totalPz}`
    }
  },
  created() {
    this.pedidos = JSON.parse(localStorage.getItem('filtrarPedidos'));
    this.productos = JSON.parse(localStorage.getItem('estadisticasProductos'));
    // this.productosFiltrados = this.productos;
  },
  methods: {
    filtrarPedidosPorZona() {

    },
    filtrarPedidosPorZonaYFechas() {

    },
    generarGraficaPorProducto() {
      /* this.productos.map((producto) => {
        if()
      }); */
    },
    cambiarFecha() {
      let date = this.fechaInicioProductos.split('-');
      /* this.fechaFiltro = `${date[2]}/${date[1]}/${date[0]}`; */
      this.fechaFiltro = new Date(`${date[1]}/${date[2]}/${date[0]}`);
    },
    cambiarFechaFin() {
      let date = this.fechaFinProductos.split('-');
      /* this.fechaFiltro = `${date[2]}/${date[1]}/${date[0]}`; */
      this.fechaFiltro2 = new Date(`${date[1]}/${date[2]}/${date[0]}`);
    },
    limpiarBusqueda() {
      this.clave = "Seleccionar";
      this.zona = "Seleccionar";
      this.fechaInicioProductos = "";
      this.fechaFinProductos = "";
      this.fechaFiltro = '',
      this.fechaFiltro2 = '',
      this.totalKg = 0;
      this.totalPz = 0;
      this.productosFiltrados = [];
      this.listaKilos = [];
      this.listaPiezas = [];

      let datatable = $('#tablaProductos').DataTable({
        data: this.productosFiltrados,
        scrollY: "400px",
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
        columns: [
          { data: 'clave', className: 'text-center' },
          { data: 'nombre', defaultContent: "" },
          { data: 'zona', className: 'text-center' },
          {
            data: 'fecha',
            render: (fecha) => {
              moment.locale('es');
              return moment(`${fecha.substr(3,2)}/${fecha.substr(0,2)}/${fecha.substr(6,4)}`).format('LL')
            }
          },
          { data: 'totalKilos', className: 'text-center', defaultContent: "" },
          { data: 'totalPiezas', className: 'text-center', defaultContent: "" }
        ],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    },
    filtrar() {
      let filtro = [];
      this.totalKg = 0;
      this.totalPz = 0;
      let ctx = document.getElementById("graficaProductos");

      //Esto es cuando el usuario ingresó todos los campos (clave, zona y entre qué fechas)
      if((this.clave != '' && this.clave != "Seleccionar") && (this.zona != '' && this.zona != "Seleccionar" ) && this.fechaInicioProductos != '' && this.fechaFinProductos != '') {
        this.productos.map((producto) => {
          let fecha = producto.fecha;
          let date = fecha.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);

          if(producto.clave === this.clave && producto.zona === this.zona && (fechaCaptura >= this.fechaFiltro && fechaCaptura <= this.fechaFiltro2)) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }//Esto es cuando el usuario ingresó solo la clave y la zona
      else if((this.clave != '' && this.clave != "Seleccionar") && (this.zona != '' && this.zona != "Seleccionar" ) && ((this.fechaInicioProductos == '' && this.fechaFinProductos == '') || (this.fechaInicioProductos == '' && this.fechaFinProductos != '') || (this.fechaInicioProductos != '' && this.fechaFinProductos == ''))) {
        this.productos.map((producto) => {
          if(producto.clave === this.clave && producto.zona === this.zona) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;

        var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
              datasets: [{
                  label: '# of Votes',
                  data: [12, 19, 3, 5, 2, 3],
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
      }//Esto es cuando el usuario solo ingresó la clave y entre qué fechas
      else if((this.clave != '' && this.clave != "Seleccionar") && (this.zona == '' || this.zona == "Seleccionar" ) && this.fechaInicioProductos != '' && this.fechaFinProductos != '') {
        this.productos.map((producto) => {
          let fecha = producto.fecha;
          let date = fecha.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if(producto.clave === this.clave && (fechaCaptura >= this.fechaFiltro && fechaCaptura <= this.fechaFiltro2)) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }//Esto es cuando el usuario solo ingresó la zona y entré que fechas
      else if((this.clave == '' || this.clave == "Seleccionar") && (this.zona != '' && this.zona != "Seleccionar" ) && this.fechaInicioProductos != '' && this.fechaFinProductos != '') {
        this.productos.map((producto) => {
          let fecha = producto.fecha;
          let date = fecha.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if(producto.zona === this.zona && (fechaCaptura >= this.fechaFiltro && fechaCaptura <= this.fechaFiltro2)) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }//Es cuando el usuario sólo ingresó la clave
      else if((this.clave != '' && this.clave != "Seleccionar") && (this.zona == '' || this.zona == "Seleccionar" ) && ((this.fechaInicioProductos == '' && this.fechaFinProductos == '') || (this.fechaInicioProductos == '' && this.fechaFinProductos != '') || (this.fechaInicioProductos != '' && this.fechaFinProductos == ''))) {
        this.productos.map((producto) => {
          if(producto.clave === this.clave) {
            filtro.push(producto);
            this.listaKilos.push(producto.totalKilos);
            this.listaPiezas.push(producto.totalPiezas);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;

        var myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ['Enero', 'Febrero'],
              datasets: [{
                  label: '# Kilos',
                  data: this.listaKilos,
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255,99,132,1)',
                  borderWidth: 1
                },
                {
                  label: '# Piezas',
                  data: this.listaPiezas,
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              },
              title: {
                display: true,
                text: this.clave
              }
          }
      });
      }//Esto es cuando el usuario sólo ingresó la zona
      else if((this.clave == '' || this.clave == "Seleccionar") && (this.zona != '' && this.zona != "Seleccionar" ) && ((this.fechaInicioProductos == '' && this.fechaFinProductos == '') || (this.fechaInicioProductos == '' && this.fechaFinProductos != '') || (this.fechaInicioProductos != '' && this.fechaFinProductos == ''))) {
        console.log("Solo zona")
        this.productos.map((producto) => {
          if(producto.zona === this.zona) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }//Esto es cuando el usuario sólo ingresó entre qué fechas
      else if((this.clave == '' || this.clave == "Seleccionar") && (this.zona == '' || this.zona == "Seleccionar" ) && this.fechaInicioProductos != '' && this.fechaFinProductos != '') {
        this.productos.map((producto) => {
          let fecha = producto.fecha;
          let date = fecha.split('/');
          let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
          if(fechaCaptura >= this.fechaFiltro && fechaCaptura <= this.fechaFiltro2) {
            filtro.push(producto);
            this.totalKg += Number(producto.totalKilos);
            this.totalPz += Number(producto.totalPiezas);
          }
        });
        this.productosFiltrados = filtro;
      }
      else {
        this.totalKg = 0;
        this.totalPz = 0;
      }
      //this.data = this.productosFiltrados;
      this.totalKg = Number(this.totalKg.toFixed(4));
      //this.total = this.productosFiltrados.length;

      let datatable = $('#tablaProductos').DataTable({
        data: this.productosFiltrados,
        scrollY: "400px",
        pageLength: 25,
        lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
        columns: [
          { data: 'clave', className: 'text-center' },
          { data: 'nombre', defaultContent: "" },
          { data: 'zona', className: 'text-center' },
          {
            data: 'fecha',
            render: (fecha) => {
              moment.locale('es');
              return moment(`${fecha.substr(3,2)}/${fecha.substr(0,2)}/${fecha.substr(6,4)}`).format('LL')
            }
          },
          { data: 'totalKilos', className: 'text-center', defaultContent: "" },
          { data: 'totalPiezas', className: 'text-center', defaultContent: "" }
        ],     
        destroy: true,
        ordering: false,
        language: LANGUAGE
      });
    }
  }
});


