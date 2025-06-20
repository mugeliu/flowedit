import requests

cookies = {
    'appmsglist_action_3584223999': 'card',
    '_qimei_q36': '',
    '_qimei_h38': 'e5b4ca5f81540b56770756a203000003618209',
    'pac_uid': '0_KP254Mizsm27s',
    'ua_id': 'InaY1N63Tw1g0c40AAAAABJ7VKoX0Al41BY9eG8QgHg=',
    'wxuin': '44209049484806',
    'cert': 'q_SSKkcto0cTlMOCKuyO3VM5NziWFjLG',
    'mm_lang': 'zh_CN',
    'rewardsn': '',
    'wxtokenkey': '777',
    'uuid': '2a9214642b9a6d2fb78a56ef7d502401',
    'rand_info': 'CAESIKcZ18cfit0XA7oeCi/O9qlsohUOYC5lFE8+BdYNN1FA',
    'slave_bizuin': '3584223999',
    'data_bizuin': '3584223999',
    'bizuin': '3584223999',
    'data_ticket': 'Ir0/1g3+UivaAUeDoqBgsiUGobDLtcCYEyBNoeGmcuWPrCudarsr5jJEJ829ftvf',
    'slave_sid': 'ajUzTXZRaWJsZ2VfdEJNeHNKYkFwMzhpOWY5cWlmNFZXTzZfU1p4djZkelVNMlI5QVNOUFpGREVOdUloVkJ2MXhHWWd5OEVzS1VDOGtEbXEyVlZmTWpVaF9jQVBtRUR0enBPeXI1OGNHMG5JWTRyRHNucEkxc0lMOUFqWExXMlV0MU12SmJtYVNmNjE2U3Nq',
    'slave_user': 'gh_f8783722b049',
    'xid': '30f9ba7d3e5c3cccc48f14ad5b9280d0',
    '_clck': '3584223999|1|fwx|0',
    '_clsk': '17z8jrn|1750438704932|20|1|mp.weixin.qq.com/weheat-agent/payload/record',
}

headers = {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarylBUaMQLeB8Z3JlRb',
    'dnt': '1',
    'origin': 'https://mp.weixin.qq.com',
    'priority': 'u=1, i',
    'referer': 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&reprint_confirm=0&timestamp=1750438121890&type=77&appmsgid=100000228&token=916369382&lang=zh_CN',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    # 'cookie': 'appmsglist_action_3584223999=card; _qimei_q36=; _qimei_h38=e5b4ca5f81540b56770756a203000003618209; pac_uid=0_KP254Mizsm27s; ua_id=InaY1N63Tw1g0c40AAAAABJ7VKoX0Al41BY9eG8QgHg=; wxuin=44209049484806; cert=q_SSKkcto0cTlMOCKuyO3VM5NziWFjLG; mm_lang=zh_CN; rewardsn=; wxtokenkey=777; uuid=2a9214642b9a6d2fb78a56ef7d502401; rand_info=CAESIKcZ18cfit0XA7oeCi/O9qlsohUOYC5lFE8+BdYNN1FA; slave_bizuin=3584223999; data_bizuin=3584223999; bizuin=3584223999; data_ticket=Ir0/1g3+UivaAUeDoqBgsiUGobDLtcCYEyBNoeGmcuWPrCudarsr5jJEJ829ftvf; slave_sid=ajUzTXZRaWJsZ2VfdEJNeHNKYkFwMzhpOWY5cWlmNFZXTzZfU1p4djZkelVNMlI5QVNOUFpGREVOdUloVkJ2MXhHWWd5OEVzS1VDOGtEbXEyVlZmTWpVaF9jQVBtRUR0enBPeXI1OGNHMG5JWTRyRHNucEkxc0lMOUFqWExXMlV0MU12SmJtYVNmNjE2U3Nq; slave_user=gh_f8783722b049; xid=30f9ba7d3e5c3cccc48f14ad5b9280d0; _clck=3584223999|1|fwx|0; _clsk=17z8jrn|1750438704932|20|1|mp.weixin.qq.com/weheat-agent/payload/record',
}

params = {
    'action': 'upload_material',
    'f': 'json',
    'scene': '8',
    'writetype': 'doublewrite',
    'groupid': '1',
    'ticket_id': 'gh_f8783722b049',
    'ticket': '0eb2b3e07fcaf76aa12032723f66172fd6d1c9fb',
    'svr_time': '1750438121',
    'token': '916369382',
    'lang': 'zh_CN',
    'seq': '1750438786221',
    't': '0.0023270957541599024',
}

files = {
    'id': (None, 'p1750438201845'),
    'name': (None, '粘贴图片_20250621005946.jpeg'),
    'type': (None, 'image/jpeg'),
    'lastModifiedDate': (None, 'Sat Jun 21 2025 00:59:46 GMT+0800 (中国标准时间)'),
    'size': (None, '213909'),
    'file': ('粘贴图片_20250621005946.jpeg', ''),
}

response = requests.post(
    'https://mp.weixin.qq.com/cgi-bin/filetransfer',
    params=params,
    cookies=cookies,
    headers=headers,
    files=files,
)