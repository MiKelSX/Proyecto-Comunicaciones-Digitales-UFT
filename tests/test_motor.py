"""Tests TDD — CommSim v2"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import pytest
import numpy as np
from core.motor_senales import (
    Motor, Params, TipoMod, TipoCod,
    ModASK, ModBPSK, ModQAM, ModOFDM,
    Factory, Cod, Canal, N_VISTA,
)

@pytest.fixture
def p(): return Params(fs=8000,fc=400,sr=40,snr=30,mod=TipoMod.BPSK,cod=TipoCod.NINGUNA)
@pytest.fixture
def m(p): mo=Motor(); mo.config(p); return mo
@pytest.fixture
def bits(): return np.array([1,0,1,1,0,0,1,0,1,1,0,1,0,0,1,0],dtype=int)

class TestCod:
    def test_hamming_len(self,bits): assert len(Cod.hamming_enc(bits[:8]))==14
    def test_hamming_rt(self,bits):
        b=bits[:8]; np.testing.assert_array_equal(Cod.hamming_dec(Cod.hamming_enc(b))[:8],b)
    def test_hamming_fix(self):
        b=np.array([1,0,1,0],dtype=int); e=Cod.hamming_enc(b); e[0]^=1
        np.testing.assert_array_equal(Cod.hamming_dec(e)[:4],b)
    def test_rep(self,bits):
        e=Cod.enc(bits[:3],TipoCod.REPETICION); assert len(e)==9
    def test_ninguna(self,bits): np.testing.assert_array_equal(Cod.enc(bits,TipoCod.NINGUNA),bits)

class TestMods:
    def test_ask_len(self,bits,p):
        s,_=ModASK().modular(bits,p); assert len(s)==len(bits)*int(p.fs/p.sr)
    def test_bpsk_rt(self,bits):
        p=Params(fs=8000,fc=400,sr=40,snr=35); mod=ModBPSK()
        s,_=mod.modular(bits,p); rx,_=mod.demodular(Canal().ruido(s,35.),p)
        assert np.sum(bits!=rx[:len(bits)])/len(bits)<0.1
    def test_qam_shape(self):
        p=Params(fs=8000,fc=400,sr=40,bps=2); bits=np.array([0,0,1,0,1,1,0,1],dtype=int)
        s,pts=ModQAM().modular(bits,p); assert len(s)>0 and pts.shape[1]==2
    def test_ofdm(self):
        p=Params(fs=8000,fc=400,sr=40,nsc=4); bits=np.array([0,1,1,0,1,0,0,1],dtype=int)
        mod=ModOFDM(); s,_=mod.modular(bits,p); rx,_=mod.demodular(Canal().ruido(s,30.),p)
        assert len(rx)>=len(bits)

class TestFactory:
    @pytest.mark.parametrize("t",list(TipoMod))
    def test_crea(self,t): m=Factory.crear(t); assert hasattr(m,'modular')

class TestCanal:
    def test_singleton(self): assert Canal() is Canal()
    def test_ruido(self): s=np.ones(500); assert not np.allclose(s,Canal().ruido(s,10.))
    def test_alta_snr(self): s=np.sin(np.linspace(0,10*np.pi,1000,dtype=np.float32)); assert np.mean((s-Canal().ruido(s,40.))**2)<0.01

class TestMotor:
    def test_rt(self,m): d=b"Hola!"; assert m.b2by(m.b2b(d))[:5]==d
    def test_ber0(self,m): b=np.array([1,0,1,0]); assert m.ber(b,b)==0.
    def test_ber1(self,m): b=np.array([1,0,1,0],dtype=int); assert m.ber(b,1-b)==1.
    def test_tx(self,m): r=m.transmitir(b"Test"); assert 0<=r.ber<=1
    def test_obs(self,m): rec=[]; m.obs(lambda r:rec.append(r)); m.transmitir(b"X"); assert len(rec)==1
    def test_vivo_keys(self,m): d=m.vivo(); assert all(k in d for k in("t","po","mo","ru","fq","pt","bits"))
    def test_vivo_fijo(self,m): assert len(m.vivo()["t"])==300
    def test_vista_max(self,m): r=m.transmitir(b"A"*50); assert len(r.v_tx)<=N_VISTA
