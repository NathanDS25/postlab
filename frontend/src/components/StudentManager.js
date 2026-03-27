import React, { useState, useEffect } from 'react';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', grade: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.grade) {
      alert('All fields required');
      return;
    }

    try {
      if (editingId) {
        const response = await fetch(`http://localhost:5000/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const updated = await response.json();
        setStudents(students.map(s => s.id === editingId ? updated : s));
      } else {
        const response = await fetch('http://localhost:5000/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const newStudent = await response.json();
        setStudents([...students, newStudent]);
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      alert('Save failed');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', grade: '' });
  };

  const handleEdit = (student) => {
    setFormData(student);
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try {
      await fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' });
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradeColors = {
    'A': 'bg-green-900/30 border border-green-500/50 text-green-300',
    'B': 'bg-blue-900/30 border border-blue-500/50 text-blue-300',
    'C': 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300',
    'D': 'bg-orange-900/30 border border-orange-500/50 text-orange-300',
    'F': 'bg-red-900/30 border border-red-500/50 text-red-300',
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">👥 Student Database</h2>
          <p className="text-gray-400">Manage student records and grades</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingId(null);
              setFormData({ name: '', email: '', grade: '' });
            }
          }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
        >
          + Add Student
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 mb-12 border border-yellow-500/20 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? '✏️ Edit Student' : '📝 Add New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 text-white border border-yellow-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700 text-white border border-yellow-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Grade</label>
              <input
                type="text"
                placeholder="e.g., A, B, C"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value.toUpperCase() })}
                maxLength="1"
                className="w-full bg-slate-700 text-white border border-yellow-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <div className="flex gap-4 w-full">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                >
                  {editingId ? '💾 Update' : '➕ Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', email: '', grade: '' });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400 mt-4">Loading students...</p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 rounded-lg border-2 border-dashed border-yellow-500/20">
          <p className="text-gray-400 text-lg">📚 No students found. Add one to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-800 rounded-lg border border-yellow-500/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-yellow-500/20 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-yellow-400 font-bold">ID</th>
                <th className="px-6 py-4 text-left text-yellow-400 font-bold">Name</th>
                <th className="px-6 py-4 text-left text-yellow-400 font-bold">Email</th>
                <th className="px-6 py-4 text-left text-yellow-400 font-bold">Grade</th>
                <th className="px-6 py-4 text-left text-yellow-400 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`border-b border-yellow-500/10 hover:bg-slate-700/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-300 font-semibold">#{student.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-semibold">{student.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400">{student.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${gradeColors[student.grade] || gradeColors['A']}`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-300"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-300"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentManager;

