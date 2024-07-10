/* eslint-disable no-undef */
import { useState } from "react"
import { useForm } from "react-hook-form"
import "./maintable.css"
import Airtable from "airtable"
import toast, { Toaster } from "react-hot-toast"

// Configura tu API Key y la base
const base = new Airtable({
  apiKey:
    "pat4H11W9GBCk0k0c.b0e156da4b63017df0c988f49ed2b9efe8319b25a5d45d1038b92a13bad4a906",
}).base("appknm0YPK3teolXe")

export const MainTabla = () => {
  const { register, handleSubmit } = useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Manejar el envío del formulario
  const onSubmit = async (formData) => {
    // Verificar que todos los campos del formData están llenos
    if (
      !formData.keyword ||
      !formData.inst_ed ||
      !formData.init_date ||
      !formData.end_date
    ) {
      toast.error("Rellena todos los campos.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const resultados = await buscarFotosPorDescripcion(formData)
      setData(resultados)
    } catch (error) {
      console.error("Error al buscar fotos por descripción:", error)
      setError("Error al realizar la búsqueda")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  function getDirectImageUrl(driveUrl) {
    try {
      const fileId = driveUrl.match(/id=([^&]+)/)[1]
      return `https://drive.google.com/thumbnail?id=${fileId}`
    } catch (error) {
      console.error(
        "Error al obtener la URL de vista previa de la imagen:",
        error
      )
      return null
    }
  }

  async function buscarFotosPorDescripcion({
    keyword,
    inst_ed,
    init_date,
    end_date,
  }) {
    try {
      setData([])
      // Obtener todos los registros de la tabla
      const records = await base("Table 2").select().all()

      // Inicializar un array para acumular los resultados
      const resultados = []

      // Iterar sobre los registros
      for (let record of records) {
        const fields = record.fields
        const fecha = fields["Name"] // Supongo que la fecha está en el campo 'Name'
        const colegio = fields["Pasted field 1"] // Supongo que el colegio está en el campo 'Pasted field 1']

        // Filtrar por fecha e institución educativa
        if (
          (!inst_ed || colegio === inst_ed) &&
          (!init_date || new Date(fecha) >= new Date(init_date)) &&
          (!end_date || new Date(fecha) <= new Date(end_date))
        ) {
          console.log(new Date(fecha), "fecha")
          console.log(new Date(init_date), "init_date")
          console.log(new Date(end_date), "end_date")

          for (let i = 1; i <= 8; i++) {
            // Construir los nombres de los campos
            const descripcionCampo = `Pasted field ${i * 2 + 1}`
            const fotoCampo = `Pasted field ${i * 2}`

            // Obtener la descripción y la foto correspondiente
            const descripcionValor = fields[descripcionCampo]
            const fotoValor = fields[fotoCampo]

            // Si la descripción coincide, añadir el objeto al array de resultados
            if (descripcionValor && descripcionValor.includes(keyword)) {
              resultados.push({
                fecha: fecha,
                colegio: colegio,
                link: fotoValor,
                descripcion: descripcionValor,
              })
            }
          }
        }
      }

      // Retornar el array de resultados
      return resultados.length > 0 ? resultados : []
    } catch (error) {
      console.error("Error al buscar la descripción:", error)
      setError("Error al realizar la búsqueda")
      return []
    }
  }

  function formatFechaHora(fechaString) {
    const fecha = new Date(fechaString)

    // Meses en español
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]

    const dia = fecha.getDate()
    const mes = meses[fecha.getMonth()]
    const año = fecha.getFullYear()
    const hora = fecha.getHours()
    const minutos = fecha.getMinutes().toString().padStart(2, "0")

    return `${dia} ${mes} ${año} ${hora}:${minutos}`
  }

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="container">
        <h1>Filtros</h1>
        <form className="filters" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="inst_ed">Institución educativa:</label>
            <input type="text" id="inst_ed" {...register("inst_ed")} />
          </div>
          <div className="form-group">
            <label htmlFor="init_date">Fecha inicial:</label>
            <input type="date" id="init_date" {...register("init_date")} />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">Fecha Fin:</label>
            <input type="date" id="end_date" {...register("end_date")} />
          </div>
          <div className="form-group">
            <label htmlFor="keyword">Palabras Clave:</label>
            <input type="text" id="keyword" {...register("keyword")} />
          </div>
          <button type="submit">Buscar</button>
        </form>
        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Fecha inicial</th>
                  <th scope="col">Institución educativa</th>
                  <th scope="col">Registro</th>
                  <th scope="col">Actividad de registro</th>
                  <th scope="col">Imagen</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{formatFechaHora(item.fecha)}</td>
                      <td>{item.colegio}</td>
                      <td>{item.link}</td>
                      <td>{item.descripcion}</td>
                      <td>
                        {item.link && (
                          <img
                            src={getDirectImageUrl(item.link)}
                            alt=""
                            srcSet=""
                            width={150}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No hay registros encontrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </>
  )
}
