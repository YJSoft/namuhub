## Namuhub란
Namuhub는 나무위키 계정/아이디의 기여 목록을 기반으로, Github 같은 기여 그래프를 만들어 주는 사이트입니다. 나무위키의 한계로 30일 이전 기여는 표시되지 않습니다.

## 설치 조건
* Python3
* libxml2, libxslt
* (윈도우 환경) Node.js

## 설치 방법
1. 파이선 3을 설치합니다. 파이선 2 버전 및 PyPy와는 호환되지 않습니다.
2. 저장소를 Fork합니다.
3. `pip install -r requirements.txt`로 파이선 모듈을 설치합니다.
4. `python3 manage.py collectstatic`으로 JS 파일을 생성합니다.
5. `python3 manage.py server`로 서버를 실행할 수 있습니다.

## 서버 실행시 옵션
* `-H` `--host` : 서버가 대기할 아이피를 설정합니다. 기본값은 `0.0.0.0`(모든 아이피에서 대기) 입니다.
* `-p` `--port` : 서버가 대기할 포트를 입력합니다. 기본값은 `24682`입니다.
* `-d` `--debug` : 디버그 모드를 활성화합니다.

## 문제 해결
### 빌드시 libxml 오류가 발생합니다
libxml2와 libxslt가 설치되어 있는지, include 경로에 libxml2 라이브러리가 지정되어 있는지 확인해 주세요.
OSX 상에서 Homebrew로 설치시
```
brew install libxml2
brew install libxslt
brew link libxml2 --force
brew link libxslt --force
```
로 libxml2 및 libxslt를 설치하고 연결할 수 있습니다.

## 고급 활용
### Apache proxy를 활용한 https 적용
(작성중)
