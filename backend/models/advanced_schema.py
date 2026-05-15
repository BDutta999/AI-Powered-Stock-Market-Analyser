from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    searches = relationship("StockSearchHistory", back_populates="user")
    watchlists = relationship("Watchlist", back_populates="user")

class StockSearchHistory(Base):
    __tablename__ = "stock_search_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ticker = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="searches")

class AIAnalysisResult(Base):
    __tablename__ = "ai_analysis_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String, index=True)
    technical_data = Column(JSON)
    sentiment_data = Column(JSON)
    reasoning_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class NewsCache(Base):
    __tablename__ = "news_cache"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String, index=True)
    headline = Column(String)
    url = Column(String)
    source = Column(String)
    published_at = Column(DateTime)
    fetched_at = Column(DateTime, default=datetime.datetime.utcnow)

class Watchlist(Base):
    __tablename__ = "watchlists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ticker = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="watchlists")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ticker = Column(String, nullable=False)
    target_price = Column(Float, nullable=True)
    condition = Column(String) # e.g. "above", "below", "golden_cross"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
