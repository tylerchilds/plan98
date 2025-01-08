#!/bin/sh

mkdir -p miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda3/miniconda.sh
bash miniconda3/miniconda.sh -b -u -p miniconda3
rm miniconda3/miniconda.sh

source miniconda3/bin/activate

conda create -n openvoice python=3.9
conda activate openvoice
git clone git@github.com:myshell-ai/OpenVoice.git

curl -O https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip

unzip checkpoints_v2_0417.zip -d OpenVoice 

cd OpenVoice

pip install -e .

pip install git+https://github.com/myshell-ai/MeloTTS.git
python -m unidic download
