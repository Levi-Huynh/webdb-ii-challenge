const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const server = express();

server.use(express.json());
server.use(helmet());



// endpoints here

const knexConfig = {
  client: 'sqlite3',
  connection: { //string or object
    filename: './data/lambda.sqlite3' //from the root folder
  },
  useNullAsDefault: true,
};


const db = knex(knexConfig);

server.get('/api/zoos', (req, res) => {
  db('zoos')
  .then(zoos=> {
    res.status(200).json(zoos);
  })
  .catch(err => {
    console.log(err)
  });

})

server.get('/api/bears', (req, res) => {
  db('bears')
  .then(bears=> {
    res.status(200).json(bears);
  })
  .catch(err => {
    console.log(err)
  });

})

server.get('/api/zoos/:id', (req, res) => {
  // retrieve a role by id
   //if using primary key & know its unique can use json.(role[0])
   //built into knex is .first() (which fetches first element of result and gives you object back)
 db('zoos')
 .where({id: req.params.id})
 .first()
 .then(zoos => {
   if(zoos) {
    res.status(200).json(zoos);
   } else {
     res.status(404).json({message: "zoo not found"});
   }
   
 })
 .catch(err => {
   res.status(500).json(err);
 });
});


server.post('/api/zoos', (req, res) => {
  // add a role to the database
  //insert into roles () values (req.body)
  //SQL LITE3 does not support returning array
  //Postgres you can use (req.body, ['id', 'name', 'etc'])
  //returns only id below, bc many cases client is the one that sends all 20 other feilds
  //with sql lite3 always will get id of last data inserted


  //allows you to get the name and id back
  db('zoos')
  .insert(req.body, 'id')
  .then(ids => {
    db('zoos')
    .where({id: ids[0]})
  .first()
  .then(zoos => {
    res.status(200).json(zoos);
  })
  .catch(err => {
  res.status(500).json(err);
  });
})
.catch(err => {
res.status(500).json(err);
});
});

server.put('/api/zoos/:id', (req, res) => {
  //filter records first before update and delete
  // update roles
 db('zoos')
 .where({id: req.params.id})
 .update(req.body)
 .then(count => {
    if (count > 0) {
          res.status(200).json({message:`${count} records updated`});
    }else {
      res.status(404).json({message: 'Role does not exist'});
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

server.delete('/api/zoos/:id', (req, res) => {
  // remove roles (inactivate the role)
  db('zoos')
  .where({id: req.params.id})
  .del()
  .then(count => {
     if (count > 0) {
           res.status(200).json({message:`${count} records deleted`});
     }else {
       res.status(404).json({message: 'Role does not exist'});
     }
   })
   .catch(err => {
     console.log(err);
     res.status(500).json(err);
   });
});

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
