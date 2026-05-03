from database import conn
def run(conn):
    # make a "cursor" which is an object to 
    # help us run SQL and fetch data
    cur = conn.cursor()

    # add another user
    restaurant_id = input("Please enter your restaurant id: ")
    name = input("Please enter the restaurant name: ")
    food_category = input("Please enter the food_category: ")
    price_category = input("Please enter the price_category: ")
    you_pass_eligible = input("Please enter if you_pass_eligible: ")

    # this time we'll use parameter binding
    cur.execute("INSERT INTO restaurants VALUES (%s, %s, %s, %s, %s)", (restaurant_id, name, food_category, price_category, you_pass_eligible))

    # commit the changes
    conn.commit()

    # close the connection
    conn.close()
