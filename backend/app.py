
from datetime import datetime
import os
from sqlite3 import IntegrityError
from flask import Flask, request, jsonify, session, abort
from flask_sqlalchemy import SQLAlchemy 
from sqlalchemy import text
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import SQLAlchemyError
from datetime import date


app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'default-secret-key')


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_ECHO'] = True


app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {
        'timeout': 30   
    }
}
db = SQLAlchemy(app)



class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = (
        db.Index('idx_user_email', 'email'),
    )
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(100))
    password = db.Column(db.String(50))
    role = db.Column(db.String(50))
    date_created = db.Column(db.DateTime, default=datetime.now)

class Movie(db.Model):
    __tablename__ = 'movie'
    __table_args__ = (
        db.Index('idx_movie_genre', 'genre'),
    )
    movie_id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100))
    director = db.Column(db.String(50))
    genre = db.Column(db.String(50))
    runtime = db.Column(db.String(50))
    release_year = db.Column(db.Integer)
    description = db.Column(db.String(500))

class Screening(db.Model):
    __tablename__ = 'screening'
    __table_args__ = (
        db.UniqueConstraint('movie_id', 'screening_date', 'screening_time', name='unique_screening'),
        db.Index('idx_screening_movie_id', 'movie_id'),
        db.Index('idx_screening_venue_id', 'venue_id'),
        db.Index('idx_screening_date', 'screening_date'),
    )
    screening_id = db.Column(db.Integer, primary_key=True) 
    movie_id = db.Column(db.Integer, db.ForeignKey('movie.movie_id'), nullable=False)
    venue_id = db.Column(db.Integer, db.ForeignKey('venue.venue_id'), nullable=False)
    screening_date = db.Column(db.Date, nullable=False)
    screening_time = db.Column(db.Time, nullable=False)
    rsvp_count = db.Column(db.Integer) 
    status = db.Column(db.String(20), nullable=False, default='scheduled')
    movie = db.relationship('Movie', backref=db.backref('screenings', lazy=True))
    venue = db.relationship('Venue', backref=db.backref('screenings', lazy=True))


class Venue(db.Model):
    __tablename__ = 'venue'
    venue_id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(100), nullable = False)
    address = db.Column(db.String(100), nullable = False)
    capacity = db.Column(db.Integer)

class RSVP(db.Model):
    __tablename__ = 'rsvp'
    __table_args__ = (
        db.Index('idx_rsvp_screening_id', 'screening_id'),
    )
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), primary_key=True, nullable=False)
    screening_id = db.Column(db.Integer, db.ForeignKey('screening.screening_id'), primary_key=True, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    screening = db.relationship('Screening', backref=db.backref('rsvps', cascade="all, delete-orphan", lazy=True))
    user = db.relationship('User', backref=db.backref('rsvps', lazy=True))


@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    name     = data.get('name')
    email    = data.get('email')
    password = data.get('password')
    role     = data.get('role')

    if not all([name, email, password, role]):
        return jsonify({'error': 'name, email, password, and role are required.'}), 400

    try:
        # begin/commit happens automatically and releases the lock immediately
        with db.session.begin():
            new_user = User(
                name=name,
                email=email,
                password=password,
                role=role
            )
            db.session.add(new_user)
    except SQLAlchemyError as e:
   
        return jsonify({'error': 'Could not create user.'}), 500

    return jsonify({
        'id':           new_user.user_id,
        'name':         new_user.name,
        'email':        new_user.email,
        'role':         new_user.role
    }), 200

@app.route('/movies', methods=['POST'])
def create_movie():
    data = request.get_json()
   
    runtime = int(data.get('runtime')) if data.get('runtime') else None
    release_year = int(data.get('release_year')) if data.get('release_year') else None

    new_movie = Movie(
        title=data.get('title'),
        director=data.get('director'),
        genre=data.get('genre'),
        runtime=runtime,
        release_year=release_year,
        description=data.get('description')
    )
    db.session.add(new_movie)
    db.session.commit()

    return jsonify({
        'id': new_movie.movie_id,
        'title': new_movie.title,
        'director': new_movie.director,
        'genre': new_movie.genre,
        'runtime': new_movie.runtime,
        'release_year': new_movie.release_year
    }), 201


@app.route('/venues', methods=['POST'])
def create_venue():
    data = request.get_json()
    name = data.get('name')
    capacity = data.get('capacity')
    address = data.get('address')  

    # name and capacity are required
    if not name or not capacity:
        return jsonify({'error': 'Name and capacity are required.'}), 400

    new_venue = Venue(name=name, capacity=capacity, address=address)
    db.session.add(new_venue)
    db.session.commit()
    
    return jsonify({
        'venue_id': new_venue.venue_id,
        'name': new_venue.name,
        'capacity': new_venue.capacity,
        'address': new_venue.address
    }), 201

@app.route('/venues', methods=['GET'])
def list_venues():
    venues = Venue.query.all()
    result = [
        {
            'venue_id': venue.venue_id,
            'name': venue.name,
            'capacity': venue.capacity,
            'address': venue.address  
        }
        for venue in venues
    ]
    return jsonify(result), 200


@app.route('/movies', methods=['GET'])
def list_movies():
    movies = Movie.query.all()
    result = [
        {
            'id': movie.movie_id,
            'title': movie.title,
            'director': movie.director,
            'genre': movie.genre,
            'runtime': movie.runtime,
            'release_year': movie.release_year,
            'description' : movie.description
        }
        for movie in movies
    ]
    return jsonify(result), 200


@app.route('/schedule-screening', methods=['POST'])
def create_screening():
    data = request.get_json() or {}
    try:
        screening_date = datetime.strptime(data.get('screening_date'), "%Y-%m-%d").date()
        screening_time = datetime.strptime(data.get('screening_time'), "%H:%M").time()
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Date/Time format error: {e}"}), 400

    movie_id = data.get('movie_id')
    venue_id = data.get('venue_id')
    if not all([movie_id, venue_id]):
        return jsonify({'error': 'movie_id and venue_id are required.'}), 400

    try:
        with db.session.begin():
            # check for duplicate
            existing = Screening.query.filter_by(
                movie_id=movie_id,
                screening_date=screening_date,
                screening_time=screening_time
            ).first()
            if existing:
                abort(409, "A screening with these details already exists.")

            # create
            new_screening = Screening(
                movie_id=movie_id,
                venue_id=venue_id,
                screening_date=screening_date,
                screening_time=screening_time,
                rsvp_count=data.get('rsvp_count'),
                status=data.get('status', 'scheduled')
            )
            db.session.add(new_screening)
        # commit on exit
    except IntegrityError:
        return jsonify({'error': 'A screening with these details already exists.'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'id':            new_screening.screening_id,
        'movie_id':      new_screening.movie_id,
        'venue_id':      new_screening.venue_id,
        'screening_date': new_screening.screening_date.isoformat(),
        'screening_time': new_screening.screening_time.strftime("%H:%M"),
        'status':        new_screening.status,
        'rsvp_count':    new_screening.rsvp_count
    }), 201



@app.route('/screenings/<int:screening_id>', methods=['DELETE'])
def delete_screening(screening_id):
    try:
        with db.session.begin():
            screening = Screening.query.get(screening_id)
            if not screening:
                abort(404, "Not found")
            if screening.status not in ('scheduled','cancelled'):
                abort(400, "Cannot delete in current status")

            RSVP.query.filter_by(screening_id=screening_id).delete()
            db.session.delete(screening)
        # commit
    except Exception as e:
        return jsonify({'error': str(e)}), getattr(e, 'code', 500)
    return jsonify({'message': 'Deleted'}), 200


@app.route('/screenings/<int:screening_id>', methods=['PATCH'])
def update_screening(screening_id):
    data = request.get_json()
    screening = Screening.query.get(screening_id)
    if not screening:
        return jsonify({"error": "Screening not found"}), 404

    if 'movie_id' in data:
        screening.movie_id = int(data.get('movie_id'))
    if 'venue_id' in data:  # Use venue_id instead of venue_name
        screening.venue_id = int(data.get('venue_id'))
    if 'screening_date' in data:
        try:
            screening.screening_date = datetime.strptime(data.get('screening_date'), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid screening_date format. Use YYYY-MM-DD."}), 400
    if 'screening_time' in data:
        try:
            screening.screening_time = datetime.strptime(data.get('screening_time'), "%H:%M").time()
        except ValueError:
            return jsonify({"error": "Invalid screening_time format. Use HH:MM."}), 400
    if 'status' in data:
        screening.status = data.get('status')

    db.session.commit()
    return jsonify({
        'id': screening.screening_id,
        'movie_id': screening.movie_id,
        'venue_id': screening.venue_id,
        'venue_name': screening.venue.name if screening.venue else None,  # Include venue name from relationship
        'screening_date': screening.screening_date.isoformat(),
        'screening_time': screening.screening_time.strftime("%H:%M"),
        'status': screening.status
    }), 200

@app.route('/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    email    = data.get('email')
    password = data.get('password')
    portal   = data.get('portal')  


    if not email or not password or not portal:
        return jsonify({'error': 'Email, password and portal are required.'}), 400

   
    if portal not in ('attendee', 'organizer'):
        return jsonify({'error': f'Unknown portal “{portal}”. Use "attendee" or "organizer".'}), 400

    
    user = User.query.filter_by(email=email).first()
    if not user or user.password != password:
        return jsonify({'error': 'Invalid email or password.'}), 401

   
    if user.role != portal:
        return jsonify({
            'error': f'You are registered as a "{user.role}". '
                     f'Please log in via the {user.role} portal.'
        }), 403


    session['user_id']    = user.user_id
    session['user_email'] = user.email
    session['user_role']  = user.role

    return jsonify({
        'id':    user.user_id,
        'name':  user.name,
        'email': user.email,
        'role':  user.role,
    }), 200

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email        = data.get('email')
    new_password = data.get('new_password')


    if not email or not new_password:
        return jsonify({'error': 'Email and new_password are required.'}), 400

   
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'No account found with that email.'}), 404

    try:
      
        user.password = new_password
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred.'}), 500


    return jsonify({'message': 'Password reset successfully!'}), 200


@app.route('/screenings', methods=['GET'])
def list_screenings():
    screenings = Screening.query.all()
    result = [
        {
            'id': screening.screening_id,
            'movie_id': screening.movie_id,
            'movie_title': screening.movie.title if screening.movie else None,
            'venue_id': screening.venue_id,  
            'venue_name': screening.venue.name if screening.venue else None,
            'screening_date': screening.screening_date.isoformat(),
            'screening_time': screening.screening_time.strftime("%H:%M")
        }
        for screening in screenings
    ]
    return jsonify(result), 200



@app.route('/rsvps', methods=['POST'])
def create_rsvp():
    data = request.get_json() or {}
    app.logger.debug("create_rsvp payload: %r", data)
    app.logger.debug("session contents: %r", dict(session))
    screening_id = data.get('screening_id')
    user_id      = session.get('user_id')

    app.logger.debug(screening_id)
    app.logger.debug(user_id)
    if not screening_id or not user_id:
        return jsonify({'error': 'screening_id and user must be provided.'}), 400

    try:
        with db.session.begin():
            # Duplicate-check against the index
            existing = RSVP.query.get((user_id, screening_id))
            if existing:
                abort(409, "You have already RSVPed to this screening.")

            # Insert the RSVP
            new_rsvp = RSVP(user_id=user_id, screening_id=screening_id)
            db.session.add(new_rsvp)

            # Lock & update the Screening row in one atomic step
            screening = (
                Screening.query
                         .with_for_update()         # row-level lock
                         .filter_by(screening_id=screening_id)
                         .one_or_none()
            )
            if not screening:
                abort(404, "Screening not found.")

            screening.rsvp_count = (screening.rsvp_count or 0) + 1

        # transaction commits automatically

        return jsonify({
            'user_id':      new_rsvp.user_id,
            'screening_id': new_rsvp.screening_id,
            'timestamp':    new_rsvp.timestamp.isoformat()
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'RSVP conflict.'}), 409

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/screenings/<int:screening_id>/rsvps', methods=['GET'])
def get_screening_rsvps(screening_id):
    
    # join RSVP, User to pull name & email
    records = (
        db.session.query(RSVP, User)
        .join(User, RSVP.user_id == User.user_id)
        .filter(RSVP.screening_id == screening_id)
        .all()
    )

    # serialize into the shape your React component expects
    output = []
    for rsvp, user in records:
        output.append({
            'user_id':      user.user_id,
            'screening_id': rsvp.screening_id,
            'name':         user.name,
            'email':        user.email,
            'timestamp':    rsvp.timestamp.isoformat()
        })

    return jsonify(output), 200


@app.route('/explore-movies', methods=['GET'])
def explore_movies():
    movies = Movie.query.all()
    result = [
        {
            'id': movie.movie_id,
            'title': movie.title,
            'director': movie.director,
            'genre': movie.genre,
            'runtime': movie.runtime,
            'release_year': movie.release_year,
            'description': movie.description
        }
        for movie in movies
    ]
    return jsonify(result), 200




REPORT_SQL = text("""
SELECT
    s.screening_date    AS screening_date,
    s.screening_time    AS screening_time,
    v.name              AS venue_name,
    m.title             AS movie_title,
    m.genre             AS genre,
    s.rsvp_count        AS rsvp_count
FROM screening AS s
  JOIN venue AS v ON s.venue_id = v.venue_id
  JOIN movie AS m ON s.movie_id = m.movie_id
WHERE
    (:start_date IS NULL OR s.screening_date >= :start_date)
  AND (:end_date   IS NULL OR s.screening_date <= :end_date)
  AND (:venue_id   IS NULL OR s.venue_id      = :venue_id)
  AND (:genre      IS NULL OR m.genre         = :genre)
ORDER BY
    s.screening_date,
    s.screening_time
""")

@app.route('/reports/screenings', methods=['GET'])
def report_screenings():
    # Read filters from the query string
    start_date = request.args.get('start_date')  
    end_date   = request.args.get('end_date')
    venue_str  = request.args.get('venue_id')
    genre      = request.args.get('genre')


    try:
        venue_id = int(venue_str) if venue_str else None
    except ValueError:
        abort(400, "venue_id must be an integer")

    # Execute the prepared statement with bound parameters
    result = db.session.execute(
        REPORT_SQL,
        {
            'start_date': start_date,
            'end_date':   end_date,
            'venue_id':   venue_id,
            'genre':      genre or None
        }
    )

    # Fetch and serialize rows 
    rows = result.fetchall()
    output = [
        {
            'screening_date': r.screening_date,
            'screening_time': r.screening_time,
            'venue_name':     r.venue_name,
            'movie_title':    r.movie_title,
            'genre':          r.genre,
            'rsvp_count':     r.rsvp_count
        }
        for r in rows
    ]

    return jsonify(output)




STATS_SQL = text("""
SELECT
    COUNT(*)                                    AS total_screenings,
    COALESCE(SUM(s.rsvp_count),   0)            AS total_rsvps,
    COALESCE(AVG(CAST(m.runtime AS INTEGER)),0) AS avg_duration,
    COALESCE(
      CASE
        WHEN COALESCE(SUM(v.capacity),0) = 0 THEN 0
        ELSE SUM(s.rsvp_count)*1.0/COALESCE(SUM(v.capacity),0)*100
      END
    , 0)                                         AS occupancy_rate
FROM screening s
JOIN movie   m ON s.movie_id   = m.movie_id
JOIN venue   v ON s.venue_id   = v.venue_id
WHERE
    (:start_date IS NULL OR s.screening_date >= :start_date)
  AND (:end_date   IS NULL OR s.screening_date <= :end_date)
  AND (:venue_id   IS NULL OR s.venue_id      = :venue_id)
  AND (:genre      IS NULL OR m.genre         = :genre)
""")

@app.route('/reports/detailedscreeningreport', methods=['GET'])
def detailed_screening_report():
    sd  = request.args.get('start_date')
    ed  = request.args.get('end_date')
    vid = request.args.get('venue_id')
    gen = request.args.get('genre')

    try:
        venue_id = int(vid) if vid else None
    except ValueError:
        abort(400, "venue_id must be an integer")

    # Execute prepared statement
    row = db.session.execute(
        STATS_SQL,
        {
            'start_date': sd or None,
            'end_date':   ed or None,
            'venue_id':   venue_id,
            'genre':      gen or None
        }
    ).first()

   
    total_screenings = row.total_screenings or 0
    total_rsvps      = row.total_rsvps      or 0
    avg_duration     = row.avg_duration     or 0.0
    occupancy_rate   = row.occupancy_rate   or 0.0

    return jsonify({
        'total_screenings': int(total_screenings),
        'total_rsvps':      int(total_rsvps),
        'avg_duration':     float(avg_duration),
        'occupancy_rate':   float(occupancy_rate)
    })

# Prepared SQL for the two reports
POPULARITY_SQL = text("""
SELECT
  m.title               AS movie_title,
  m.director            AS director,
  m.genre               AS genre,
  COUNT(s.screening_id) AS screenings_count,
  AVG(s.rsvp_count)     AS average_attendance
FROM screening s
  JOIN movie m ON s.movie_id = m.movie_id
WHERE (:genre IS NULL OR m.genre = :genre)
GROUP BY m.title, m.director, m.genre
ORDER BY average_attendance DESC
""")

GENRE_SQL = text("""
SELECT
  m.genre               AS genre,
  COUNT(s.screening_id) AS total_screenings,
  AVG(s.rsvp_count)     AS average_attendance
FROM screening s
  JOIN movie m ON s.movie_id = m.movie_id
WHERE (:genre IS NULL OR m.genre = :genre)
GROUP BY m.genre
""")
@app.route('/reports/popularity-genre', methods=['GET'])
def popularity_genre_report():
    gen = request.args.get('genre') or None

    pop_rows = db.session.execute(POPULARITY_SQL, {'genre': gen}).fetchall()
    gen_rows = db.session.execute(GENRE_SQL,      {'genre': gen}).fetchall()

    popularity = [
        {
          'movie_title':      r.movie_title,
          'director':         r.director,
          'genre':            r.genre,
          'screenings_count': int(r.screenings_count),
          'average_attendance': float(r.average_attendance or 0)
        }
        for r in pop_rows
    ]

    genre_analysis = [
        {
          'genre':             r.genre,
          'total_screenings':  int(r.total_screenings),
          'average_attendance': float(r.average_attendance or 0)
        }
        for r in gen_rows
    ]

    return jsonify({
      'popularity':     popularity,
      'genre_analysis': genre_analysis
    })


if __name__ == "__main__":
    app.run(debug=True)










