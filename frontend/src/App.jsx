import { useState, useEffect } from 'react';
import api from './api';

function App() {
  // 1. ESTADOS (Todos al inicio)
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewArchived, setViewArchived] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. CARGA DE DATOS
  useEffect(() => {
    fetchNotes();
  }, [viewArchived]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notes?archived=${viewArchived}`);
      setNotes(response.data);
    } catch (error) {
      console.error("Error al obtener notas:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGICA DE FILTRADO (Se ejecuta en cada renderizado)
  const filteredNotes = notes.filter(note => {
    if (!filterCategory) return true;
    // El operador ?. previene errores si la nota no tiene categorías
    return note.categories?.some(cat => 
      cat.toLowerCase().includes(filterCategory.toLowerCase())
    );
  });

  // 4. MANEJO DEL FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("Completa título y contenido");

    const noteData = { 
      title, 
      content, 
      categories: categories ? categories.split(',').map(cat => cat.trim()).filter(cat => cat !== '') : [] 
    };

    try {
      if (editingId) {
        await api.patch(`/notes/${editingId}`, noteData);
        setEditingId(null);
      } else {
        await api.post('/notes', noteData);
      }
      
      setTitle('');
      setContent('');
      setCategories('');
      fetchNotes();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // 5. ACCIONES DE NOTA
  const deleteNote = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta nota?")) {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    }
  };

  const toggleArchive = async (id, currentStatus) => {
    await api.patch(`/notes/${id}`, { isArchived: !currentStatus });
    fetchNotes();
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategories(note.categories ? note.categories.join(', ') : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategories('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>{viewArchived ? 'Notas Archivadas' : 'Mis Notas Activas'}</h1>
      
      <button 
        onClick={() => setViewArchived(!viewArchived)}
        style={{ marginBottom: '20px', padding: '10px', cursor: 'pointer' }}
      >
        Ver {viewArchived ? 'Notas Activas' : 'Notas Archivadas'}
      </button>

      {!viewArchived && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', color: 'white' }}>
          <h3>{editingId ? 'Editando Nota' : 'Nueva Nota'}</h3>
          <input 
            placeholder="Título" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ display: 'block', width: '96%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: 'none' }}
          />
          <textarea 
            placeholder="Contenido" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            style={{ display: 'block', width: '96%', marginBottom: '10px', padding: '8px', minHeight: '80px', borderRadius: '4px', border: 'none' }}
          />
          <input 
            placeholder="Categorías (ej: Trabajo, Urgente)" 
            value={categories} 
            onChange={(e) => setCategories(e.target.value)} 
            style={{ display: 'block', width: '96%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: 'none' }}
          />

          <button type="submit" style={{ padding: '10px 20px', backgroundColor: editingId ? '#ffc107' : '#28a745', color: editingId ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? 'Actualizar Nota' : 'Guardar Nota'}
          </button>
          
          {editingId && (
            <button type="button" onClick={cancelEditing} style={{ marginLeft: '10px', padding: '10px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </form>
      )}

      <hr />

      <div style={{ marginTop: '20px' }}>
        <h3>Listado de notas</h3>
        
        {/* BUSCADOR / FILTRO */}
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px' }}>
          <label style={{ fontWeight: 'bold' }}>🔍 Filtrar por categoría: </label>
          <input 
            type="text" 
            placeholder="Escribe para buscar..." 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginLeft: '10px', width: '200px' }}
          />
          {filterCategory && (
            <button onClick={() => setFilterCategory('')} style={{ marginLeft: '10px', cursor: 'pointer' }}>
              Limpiar
            </button>
          )}
        </div>

        {loading ? <p>Cargando notas...</p> : (
          <>
            {filteredNotes.length === 0 && <p>No se encontraron notas con esos criterios.</p>}
            {filteredNotes.map(note => (
              <div key={note.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0 }}>{note.title}</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                
                <div style={{ marginBottom: '15px' }}>
                  {note.categories?.map((cat, index) => (
                    <span key={index} style={{ backgroundColor: '#e0e0e0', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', marginRight: '5px', color: '#333', border: '1px solid #ccc' }}>
                      #{cat}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => startEditing(note)} style={{ padding: '5px 12px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => toggleArchive(note.id, note.isArchived)} style={{ padding: '5px 12px', cursor: 'pointer' }}>
                    {note.isArchived ? 'Desarchivar' : 'Archivar'}
                  </button>
                  <button onClick={() => deleteNote(note.id)} style={{ padding: '5px 12px', color: 'red', cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;