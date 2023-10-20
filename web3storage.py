import requests
import w3storage

w3 = w3storage.API(
    token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhFY2UxMDhhMDRmN2FlQjBDYTMyMjZkN0UwNkMwQzNEQkQ4QmVCRGEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODQ3OTQ5NDYzMzMsIm5hbWUiOiJWb2ljZWZsb3cifQ.5uFjHkx7hxIauPjfdFEidTgFSAn1RwypQWjUZ2-o4WM"
)


def uploadImageToIPFS(url):
    save_path = "downloaded_image.jpg"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for any errors

        with open(save_path, "wb") as file:
            file.write(response.content)

        print(f"Image downloaded and saved at {save_path}")
        cid = w3.post_upload((save_path, open(save_path, "rb")))
        print(cid)
        return cid + ".ipfs.w3s.link"
    except Exception as e:
        print(f"Error: {e}")
        return url


# some_uploads = w3.user_uploads(size=25)

# # limited to 100 MB
# helloworld_cid = w3.post_upload(('hello_World.txt', 'Hello, world.'))
# readme_cid = w3.post_upload(('README.md', open('README.md', 'rb')))

# larger files can be uploaded by splitting them into .cars.


# uploadImageToIPFS(
#     "https://media.discordapp.net/attachments/1164723218909765733/1164725269521776650/AP22336057628445-e1686871717480.webp?width=1594&height=896"
# )
