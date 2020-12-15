import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {
  filterImageFromURL,
  deleteLocalFiles
} from './util/util';
import { config } from './config/config';
import Jimp = require('jimp');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  //CORS Should be restricted
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://udacity-image-filter-christ-dev.eu-central-1.elasticbeanstalk.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Get variables from config file
  const conf = config;

 // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let { image_url } = req.query;

    let apiKey = req.header("X-API-Key");

    if (!apiKey || apiKey != conf.api_key) {
      return res.status(401).send({ auth: false, message: 'Unauthorized - Invalid api key.' });
    }

    if (!image_url) {
      return res.status(422).send({ auth: true, message: 'An image URL is required.'});
    }

    try {
      // Filter the image.
      const filteredpath = await filterImageFromURL(image_url)
      // Send the resulting file in response.
      res.status(200).sendFile(filteredpath, {}, (err) => {
        if (err) { return res.status(422).send('Unprocessable Entity - Not able to process the image.'); }
        // Deleting any used image file.
        deleteLocalFiles([filteredpath]);
      })
    } catch (err) {
      res.status(422).send('Unprocessable Entity - Not able to process the image, make sure image url you are using is correct.');
    }
  });

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("If you want to filter a public image simply try http://{{HOST}}/filteredimage?image_url={{IMAGE URL}} :)")
  });
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();