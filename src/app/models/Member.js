const db = require('../../config/db')
const { age, date } = require('../../lib/utils')

module.exports = {
  //Funções padrões
  all(callback){
    db.query(`SELECT * FROM members ORDER BY name ASC`, function(err, results){
      if(err){
        throw `Database Error! ${err}`
      }
      callback(results.rows)
    })
  },

  create(data, callback){
    const query = `
      INSERT INTO members (
        avatar_url,
        name,
        email,
        birth,
        gender,
        blood,
        weight,
        height,
        instructor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `

    const values = [
      data.avatar_url,
      data.name,
      data.email,
      date(data.birth).iso,
      data.gender,
      data.blood,
      data.weight,
      data.height,
      data.instructor
    ]

    db.query(query, values, function(err, results){
      if(err){
        throw `Database Error! ${err}`
      }

      callback(results.rows[0])
    })
  },

  find(id, callback){
    db.query(`
    SELECT members.*, instructors.name AS instructor_name
    FROM members
    lEFT JOIN instructors ON (members.instructor_id = instructors.id) 
    WHERE members.id = $1`, [id], function(err, results){
      if(err){
        throw `Database Error! ${err}`
      }
      callback(results.rows[0])
    })
  },

  update(data, callback){
    const query = `
      UPDATE members SET 
        avatar_url=($1),
        name=($2),
        email=($3),
        birth=($4),
        gender=($5),
        blood=($6),
        weight=($7),
        height=($8),
        instructor_id=($9)
      WHERE id = $10
    `

    const values = [
      data.avatar_url,
      data.name,
      data.email,
      date(data.birth).iso,
      data.gender,
      data.blood,
      data.weight,
      data.height,
      data.instructor,
      data.id
    ]

    db.query(query, values, function(err, results){
      if(err){
        throw `Database Error! ${err}`  
      }

      callback()
    })
  },

  delete(id, callback){
    db.query(`DELETE FROM members WHERE id = $1`, [id], function(err, results){
      if(err){
        throw `Database Error! ${err}`
      }
      callback()
    })
  },

  instructorSelectOptions(callback){
    db.query(`SELECT name, id FROM instructors`, function(err, results){
      if(err){
        throw `Database error: ${err}`
      }
      callback(results.rows)
    })
  },

  paginate(params){
    const { filter, limit, offset, callback } = params
  
    let query = ""
    let filterQuery = ""
    let totalQuery = `(SELECT count(*) FROM members) AS total`

    if(filter){
      filterQuery = 
      `WHERE members.name ILIKE '%${filter}%'
      OR members.email ILIKE '%${filter}%'`

      totalQuery = `(SELECT count(*) FROM members ${filterQuery}) AS total`
    }

    query = `SELECT members.*, ${totalQuery}
    FROM members 
    ${filterQuery}
    ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}
    `


    db.query(query, function(err, results){
      if(err){
        throw `Database error: ${err}`
      }
      callback(results.rows)
    })
  }
}