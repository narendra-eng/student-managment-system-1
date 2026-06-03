# ================================================================
#  models.py  —  SQLAlchemy ORM Model
#  Student Management System
#  Defines the Student table and serialisation to dict/JSON
# ================================================================

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Single shared db instance — imported and initialised in app.py
db = SQLAlchemy()


class Student(db.Model):
    """
    ORM representation of the 'students' table in SQLite.

    Columns
    -------
    id           : auto-increment primary key
    name         : student full name          (required)
    course       : enrolled course            (required)
    age          : student age                (required, 1-100)
    joining_date : date the student enrolled  (required, stored as DATE)
    created_at   : record-creation timestamp  (auto, UTC)
    """

    __tablename__ = "students"

    id           = db.Column(db.Integer,      primary_key=True, autoincrement=True)
    name         = db.Column(db.String(120),  nullable=False)
    course       = db.Column(db.String(120),  nullable=False)
    age          = db.Column(db.Integer,      nullable=False)
    joining_date = db.Column(db.Date,         nullable=False)
    created_at   = db.Column(db.DateTime,     nullable=False, default=datetime.utcnow)

    def to_dict(self):
        """
        Serialize a Student row to a plain Python dict so Flask
        can return it as JSON via jsonify().

        Date formats
        ------------
        joining_date  →  "YYYY-MM-DD"   (ISO 8601, used by <input type="date">)
        created_at    →  "DD-MM-YYYY"   (display-only friendly format)
        """
        return {
            "id"          : self.id,
            "name"        : self.name,
            "course"      : self.course,
            "age"         : self.age,
            "joining_date": self.joining_date.strftime("%Y-%m-%d") if self.joining_date else "",
            "created_at"  : self.created_at.strftime("%d-%m-%Y")   if self.created_at   else "",
        }

    def __repr__(self):
        return f"<Student id={self.id} name={self.name!r}>"
