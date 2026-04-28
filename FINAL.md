# Dear candidate

Please commit this file with your name below. It is often not possible to accurately tell who the owner of a repository is. Please help us not attribute your great coding effort to a lesser candidate.

**The name on your CV is [candidate name here]**

## Thank you

Thank you for taking the time to complete this take-home coding assignment.

# Submission feedback

Added a `logErrorToService` function to log errors to an external service for troubleshooting and analytics.

## Planning

1. Read through the INSTRUCTIONS.md file to fully understand the expectation.
2. Ran curl commands in the Terminal on each endpoint to preview the results first.
3. Step 2 was crucial in understanding the format/structure of the data and the contents.
4. After looking at the data content, I decided upon the important data elements to display.

## Coding

1. Made use of AI in considerable manner to get things going.
2. Here is an example prompt that I used to test restults:

MY PROMPT:

"I have an array of data in my restuarants.ts file, which i want to load into my index.html file. Import these reccords and display them using cards inside my  <div class="restuarants-list"> which i just added. The cards should be responsive and placed side by side in rows and wrapping to the next column, only show the first. For each record, use the id value and pass it to the fetchRestaurantDetails function in api.ts to get each record from the api.  Below is an example json object from the api endpoint   `https://api.mrdfood.com/exposure/preview/v2/restaurants/${id}` inside fetchRestaurantDetails function. After fetching the record, I want to display the name, restaurant_logo.raw_image (display this in the header next to the name), statistics.avg_food_quality_rating). Also add the first 5 tag.name items and x more for the rest if there are more than 5 tags. Then list the streen number name and suruburb from the address in small font at the footer of the card. Also pull out the description and add to the body of the card. Some records will fail to fetch from the backend due to an error. Do not add those records on the cards, instead modify my  fetchRestaurantDetails for each error, log it to an external service

[{"id":"1","name":"Burgers","type":"primary_food","vertical":"restaurant"},{"id":"50","name":"all ages","type":"age_restricted","vertical":"all"},{"id":"81","name":"markup all","type":"marked_up_prices","vertical":"all"},{"id":"92","name":"menu","type":"datastore","vertical":"all"}],"departments":[],"operating_times":[{"day":"monday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false},{"day":"tuesday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false},{"day":"wednesday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false},{"day":"thursday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false},{"day":"friday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false},{"day":"saturday","is_trading":true,"start":"08:00","end":"21:00","split_shift":false}"

## Wrap up

1. Add proper styling to the dialog box that shows the menu.
2. Refactor the code to make it slimmer.
3. Code needs to be separated for better SOLID patttern.


